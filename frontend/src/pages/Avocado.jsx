import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

export default function Avocado() {
    const [sales, setSales] = useState([])

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [kg, setKg] = useState('')
    const [buyer, setBuyer] = useState('')
    const [rate, setRate] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const s = await dbService.getAll('avocado_sales')
        setSales(s.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!kg || !rate) return

        await dbService.add('avocado_sales', {
            date,
            kg: parseFloat(kg),
            buyer,
            rate: parseFloat(rate),
            total: parseFloat(kg) * parseFloat(rate),
            created_at: new Date()
        })
        setKg('')
        setBuyer('')
        setRate('')
        fetchData()
    }

    return (
        <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Record Avocado Sales</h3>
                    <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <input
                                type="date"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <input
                                type="number"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                placeholder="Weight (Kg)"
                                value={kg}
                                onChange={(e) => setKg(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <input
                                type="text"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                placeholder="Buyer Name"
                                value={buyer}
                                onChange={(e) => setBuyer(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <input
                                type="number"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                placeholder="Rate (KES 15-50)"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500 sm:ml-3 sm:mt-0 sm:w-auto"
                        >
                            Record Sale
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Sales</h3>
                </div>
                <div className="border-t border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kg</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (KES)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sales.map((sale) => (
                                <tr key={sale.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.buyer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.kg}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.rate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{sale.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
