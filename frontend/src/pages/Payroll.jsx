import { useState, useEffect } from 'react'
import { payrollService } from '../services/payroll'

export default function Payroll() {
    const [payrolls, setPayrolls] = useState([])
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        handleGenerate()
    }, [])

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const data = await payrollService.calculatePayroll(month, year)
            setPayrolls(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkPaid = async (workerId) => {
        alert('Marked as paid.')
        // In future: update status in DB
    }

    const totalPayout = payrolls.reduce((sum, p) => sum + p.total_pay, 0)

    return (
        <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Monthly Payroll</h3>
                    <div className="mt-5 sm:flex sm:items-center">
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <select
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                    <option key={i + 1} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <input
                                type="number"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500 sm:ml-3 sm:mt-0 sm:w-auto"
                        >
                            {loading ? 'Calculating...' : 'Generate Payroll'}
                        </button>
                    </div>
                </div>
            </div>

            {payrolls.length > 0 && (
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Payroll Summary</h3>
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-lg font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Total: KES {totalPayout.toLocaleString()}
                        </span>
                    </div>
                    <div className="border-t border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pay</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Pay</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payrolls.map((p) => (
                                    <tr key={p.worker_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.worker_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.role}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={p.details}>{p.details}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.total_pay.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleMarkPaid(p.worker_id)} className="text-farm-600 hover:text-farm-900">Mark Paid</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
