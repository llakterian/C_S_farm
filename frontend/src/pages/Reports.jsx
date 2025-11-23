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

    const generateReport = async () => {
        setLoading(true)
        try {
            if (activeTab === 'monthly') {
                const data = await payrollService.calculatePayroll(month, year)
                setReportData(data)
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
    }, [activeTab, month, year])

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
            <div className="bg-white p-4 rounded-lg shadow no-print flex gap-4 items-center">
                <div className="flex rounded-md shadow-sm">
                    <button
                        onClick={() => setActiveTab('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-l-md border ${activeTab === 'monthly' ? 'bg-farm-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Monthly Salary
                    </button>
                    <button
                        onClick={() => setActiveTab('annual')}
                        className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${activeTab === 'annual' ? 'bg-farm-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Annual Summary
                    </button>
                </div>

                <select value={year} onChange={e => setYear(e.target.value)} className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6">
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                </select>

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
                            {activeTab === 'monthly' ? `Salary List - ${month}/${year}` : `Annual Report - ${year}`}
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
