import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

const EXPENSE_CATEGORIES = [
    'Fertilizer', 'Feeds', 'Labor', 'Transport', 'Utilities',
    'Equipment', 'Maintenance', 'Seeds', 'Pesticides', 'Other'
]

export default function Expenses() {
    const [expenses, setExpenses] = useState([])
    const [category, setCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1)

    useEffect(() => {
        fetchExpenses()
    }, [])

    const fetchExpenses = async () => {
        const e = await dbService.getAll('expenses')
        setExpenses(e.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!category || !amount) return

        await dbService.add('expenses', {
            category,
            amount: parseFloat(amount),
            description,
            date,
            created_at: new Date()
        })

        setCategory('')
        setAmount('')
        setDescription('')
        fetchExpenses()
    }

    const filteredExpenses = expenses.filter(e =>
        new Date(e.date).getMonth() + 1 === parseInt(monthFilter)
    )

    const totalByCategory = EXPENSE_CATEGORIES.map(cat => ({
        category: cat,
        total: filteredExpenses
            .filter(e => e.category === cat)
            .reduce((sum, e) => sum + e.amount, 0)
    })).filter(c => c.total > 0)

    const grandTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

    return (
        <div className="space-y-8">
            {/* Add Expense Form */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Record Expense</h3>
                    <form className="mt-5 sm:flex sm:items-center sm:flex-wrap gap-2" onSubmit={handleSubmit}>
                        <select
                            className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="number"
                            className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            placeholder="Amount (KES)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <input
                            type="text"
                            className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <input
                            type="date"
                            className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500"
                        >
                            Add Expense
                        </button>
                    </form>
                </div>
            </div>

            {/* Summary by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Expenses by Category</h3>
                        <select
                            value={monthFilter}
                            onChange={e => setMonthFilter(e.target.value)}
                            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                <option key={i + 1} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        {totalByCategory.map(c => (
                            <div key={c.category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="font-medium text-gray-700">{c.category}</span>
                                <span className="font-bold text-gray-900">KES {c.total.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-farm-100 rounded border-2 border-farm-600">
                            <span className="font-bold text-gray-900">TOTAL</span>
                            <span className="font-bold text-farm-900 text-lg">KES {grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Expenses</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredExpenses.slice(0, 20).map(e => (
                            <div key={e.id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{e.category}</div>
                                    <div className="text-sm text-gray-500">{e.description}</div>
                                    <div className="text-xs text-gray-400">{e.date}</div>
                                </div>
                                <span className="font-bold text-red-600">-{e.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
