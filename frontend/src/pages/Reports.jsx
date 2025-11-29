import { useState, useEffect } from 'react'
import { dbService } from '../services/db'
import { payrollService } from '../services/payroll'
import { exportService } from '../services/export'

export default function Reports() {
    const [activeTab, setActiveTab] = useState('monthly')
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [reportData, setReportData] = useState(null)
    const [loading, setLoading] = useState(false)

    // Daily production state
    const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0])
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
    const [expandedDays, setExpandedDays] = useState({})

    const generateReport = async () => {
        setLoading(true)
        try {
            if (activeTab === 'monthly') {
                const data = await payrollService.calculatePayroll(month, year)
                setReportData(data)
            } else if (activeTab === 'daily') {
                // Daily Production Report
                const plucking = await dbService.getAll('tea_plucking')
                const workers = await dbService.getAll('workers')
                const factories = await dbService.getAll('factories')

                // Filter by date range
                const filteredRecords = plucking.filter(r => {
                    const recordDate = r.date
                    return recordDate >= fromDate && recordDate <= toDate
                })

                // Group by date
                const dailyData = {}
                filteredRecords.forEach(record => {
                    if (!dailyData[record.date]) {
                        dailyData[record.date] = []
                    }
                    dailyData[record.date].push(record)
                })

                // Calculate totals and worker breakdowns
                const WORKER_RATE = 8; // KES per Kg (matches payroll service)

                const report = Object.keys(dailyData).sort().reverse().map(date => {
                    const dayRecords = dailyData[date]

                    // Group by worker
                    const workerTotals = {}
                    dayRecords.forEach(record => {
                        const workerId = record.worker_id
                        const factoryId = record.factory_id
                        const factory = factories.find(f => f.id === factoryId)
                        // Farm revenue rate (Factory Rate - Transport)
                        const farmRate = factory ? (factory.rate - factory.transport) : 0

                        if (!workerTotals[workerId]) {
                            const worker = workers.find(w => w.id === workerId)
                            workerTotals[workerId] = {
                                workerName: worker?.name || 'Unknown',
                                totalKg: 0,
                                totalPayment: 0, // Worker Pay
                                totalRevenue: 0, // Farm Revenue
                                records: []
                            }
                        }

                        workerTotals[workerId].totalKg += record.weight
                        workerTotals[workerId].totalPayment += (record.weight * WORKER_RATE)
                        workerTotals[workerId].totalRevenue += (record.weight * farmRate)
                        workerTotals[workerId].records.push({
                            weight: record.weight,
                            factory: factory?.name || 'Unknown',
                            workerPay: record.weight * WORKER_RATE,
                            farmRevenue: record.weight * farmRate
                        })
                    })

                    const totalKg = Object.values(workerTotals).reduce((sum, w) => sum + w.totalKg, 0)
                    const totalPayment = Object.values(workerTotals).reduce((sum, w) => sum + w.totalPayment, 0)
                    const totalRevenue = Object.values(workerTotals).reduce((sum, w) => sum + w.totalRevenue, 0)

                    return {
                        date,
                        totalKg,
                        totalPayment,
                        totalRevenue,
                        workers: Object.values(workerTotals)
                    }
                })

                setReportData(report)
            } else {
                // Annual Report Logic
                const tea = await dbService.getAll('tea_plucking')
                const dairy = await dbService.getAll('dairy_production')
                const avocado = await dbService.getAll('avocado_sales')

                // Filter by year
                const teaYear = tea.filter(r => new Date(r.date).getFullYear() === parseInt(year))
                const dairyYear = dairy.filter(r => new Date(r.date).getFullYear() === parseInt(year))
                const avocadoYear = avocado.filter(r => new Date(r.date).getFullYear() === parseInt(year))

                // Aggregate by month
                const monthlyStats = Array.from({ length: 12 }, (_, i) => {
                    const m = i + 1
                    const t = teaYear.filter(r => new Date(r.date).getMonth() + 1 === m)
                    const d = dairyYear.filter(r => new Date(r.date).getMonth() + 1 === m)
                    const a = avocadoYear.filter(r => new Date(r.date).getMonth() + 1 === m)

                    return {
                        month: new Date(year, i).toLocaleString('default', { month: 'short' }),
                        teaKg: t.reduce((sum, r) => sum + r.weight, 0),
                        milkLiters: d.reduce((sum, r) => sum + r.liters, 0),
                        avocadoIncome: a.reduce((sum, r) => sum + r.total, 0)
                    }
                })

                setReportData(monthlyStats)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        generateReport()
    }, [activeTab, month, year, fromDate, toDate])

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between no-print">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Farm Reports
                </h2>
                <div className="mt-4 flex md:ml-4 md:mt-0 gap-2">
                    <button
                        onClick={() => {
                            if (activeTab === 'monthly') {
                                exportService.exportPayroll(reportData, month, year);
                            } else if (activeTab === 'daily') {
                                // Export daily production report
                                const csvData = reportData.flatMap(day =>
                                    day.workers.map(w => ({
                                        Date: day.date,
                                        Worker: w.workerName,
                                        'Total Kg': w.totalKg,
                                        'Worker Pay (KES)': w.totalPayment,
                                        'Farm Revenue (KES)': w.totalRevenue
                                    }))
                                );
                                exportService.exportGeneric(csvData, `Daily_Production_${fromDate}_${toDate}.csv`);
                            } else {
                                exportService.exportAnnualReport(reportData, year);
                            }
                        }}
                        className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                    >
                        📊 Export CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        🖨️ Print Report
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow no-print flex gap-4 items-center flex-wrap">
                <div className="flex rounded-md shadow-sm">
                    <button
                        onClick={() => setActiveTab('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-l-md border ${activeTab === 'monthly' ? 'bg-farm-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Monthly Salary
                    </button>
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`px-4 py-2 text-sm font-medium border-t border-b ${activeTab === 'daily' ? 'bg-farm-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Daily Production
                    </button>
                    <button
                        onClick={() => setActiveTab('annual')}
                        className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${activeTab === 'annual' ? 'bg-farm-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Annual Summary
                    </button>
                </div>

                {activeTab === 'daily' && (
                    <>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">From:</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">To:</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </>
                )}

                {activeTab !== 'daily' && (
                    <select value={year} onChange={e => setYear(e.target.value)} className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6">
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                )}

                {activeTab === 'monthly' && (
                    <select value={month} onChange={e => setMonth(e.target.value)} className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6">
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                            <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Report Content */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 print:shadow-none print:ring-0">
                <div className="px-4 py-6 sm:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold uppercase">C. Sambu Farm</h1>
                        <h2 className="text-lg font-medium text-gray-600">
                            {activeTab === 'monthly' ? `Salary List - ${month}/${year}` :
                                activeTab === 'daily' ? `Daily Production Report - ${fromDate} to ${toDate}` :
                                    `Annual Report - ${year}`}
                        </h2>
                    </div>

                    {activeTab === 'monthly' && reportData && (
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Worker</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Net Pay</th>
                                    <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Signature</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.map((p) => (
                                    <tr key={p.worker_id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{p.worker_name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{p.role}</td>
                                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{p.details}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-bold text-gray-900">{p.total_pay.toLocaleString()}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 border-b border-gray-100"></td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 font-bold">
                                    <td colSpan="3" className="py-4 pl-4 text-right">Total Payout:</td>
                                    <td className="px-3 py-4 text-right">{reportData.reduce((sum, p) => sum + p.total_pay, 0).toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'daily' && reportData && (
                        <div className="space-y-4">
                            {reportData.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No plucking records found for this date range.</p>
                            ) : (
                                reportData.map((day, idx) => (
                                    <div key={day.date} className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Day Summary */}
                                        <div
                                            onClick={() => setExpandedDays(prev => ({ ...prev, [day.date]: !prev[day.date] }))}
                                            className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <svg className={`h-5 w-5 text-gray-500 transition-transform ${expandedDays[day.date] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                                        <p className="text-sm text-gray-500">{day.workers.length} worker{day.workers.length !== 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">{day.totalKg.toFixed(1)} Kg</p>
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium text-green-600">Pay: {day.totalPayment.toLocaleString()}</span>
                                                        <span className="mx-2">|</span>
                                                        <span className="text-blue-600">Rev: {day.totalRevenue.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Worker Breakdown */}
                                        {expandedDays[day.date] && (
                                            <div className="bg-white">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (Kg)</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Worker Pay</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Farm Rev</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {day.workers.map((worker, wIdx) => (
                                                            <tr key={wIdx} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.workerName}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{worker.totalKg.toFixed(1)}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-700">{worker.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-700">{worker.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Grand Totals */}
                            {reportData.length > 0 && (
                                <div className="bg-farm-50 border-2 border-farm-600 rounded-lg px-6 py-4 mt-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900">Grand Total ({fromDate} to {toDate})</h3>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-farm-700">{reportData.reduce((sum, d) => sum + d.totalKg, 0).toFixed(1)} Kg</p>
                                            <p className="text-lg font-semibold text-green-700">Pay: KES {reportData.reduce((sum, d) => sum + d.totalPayment, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            <p className="text-lg font-semibold text-blue-700">Rev: KES {reportData.reduce((sum, d) => sum + d.totalRevenue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'annual' && reportData && (
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Month</th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Tea (Kg)</th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Milk (L)</th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Avocado (KES)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.map((m, i) => (
                                    <tr key={i}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{m.month}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">{m.teaKg.toLocaleString()}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">{m.milkLiters.toLocaleString()}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">{m.avocadoIncome.toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 font-bold">
                                    <td className="py-4 pl-4">TOTALS</td>
                                    <td className="px-3 py-4 text-right">{reportData.reduce((sum, m) => sum + m.teaKg, 0).toLocaleString()}</td>
                                    <td className="px-3 py-4 text-right">{reportData.reduce((sum, m) => sum + m.milkLiters, 0).toLocaleString()}</td>
                                    <td className="px-3 py-4 text-right">{reportData.reduce((sum, m) => sum + m.avocadoIncome, 0).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
