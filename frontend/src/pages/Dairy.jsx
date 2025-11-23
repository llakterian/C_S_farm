import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

export default function Dairy() {
    const [production, setProduction] = useState([])
    const [feeds, setFeeds] = useState([])

    // Production Form
    const [milkDate, setMilkDate] = useState(new Date().toISOString().split('T')[0])
    const [liters, setLiters] = useState('')
    const [sold, setSold] = useState('')
    const [price, setPrice] = useState('')

    // Feeds Form
    const [feedDate, setFeedDate] = useState(new Date().toISOString().split('T')[0])
    const [feedType, setFeedType] = useState('')
    const [feedCost, setFeedCost] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const p = await dbService.getAll('dairy_production')
        const f = await dbService.getAll('dairy_feeds')
        setProduction(p.sort((a, b) => new Date(b.date) - new Date(a.date)))
        setFeeds(f.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }

    const handleAddProduction = async (e) => {
        e.preventDefault()
        await dbService.add('dairy_production', {
            date: milkDate,
            liters: parseFloat(liters),
            sold: parseFloat(sold),
            price: parseFloat(price)
        })
        setLiters('')
        setSold('')
        setPrice('')
        fetchData()
    }

    const handleAddFeed = async (e) => {
        e.preventDefault()
        await dbService.add('dairy_feeds', {
            date: feedDate,
            type: feedType,
            cost: parseFloat(feedCost)
        })
        setFeedType('')
        setFeedCost('')
        fetchData()
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Milk Production */}
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Record Milk Production</h3>
                    <form className="mt-5 space-y-4" onSubmit={handleAddProduction}>
                        <input
                            type="date"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            value={milkDate}
                            onChange={(e) => setMilkDate(e.target.value)}
                        />
                        <input
                            type="number"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            placeholder="Total Liters"
                            value={liters}
                            onChange={(e) => setLiters(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                placeholder="Liters Sold"
                                value={sold}
                                onChange={(e) => setSold(e.target.value)}
                            />
                            <input
                                type="number"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                placeholder="Price/Liter"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500"
                        >
                            Record Production
                        </button>
                    </form>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900">Recent Production</h4>
                        <ul className="mt-2 divide-y divide-gray-200">
                            {production.slice(0, 5).map(p => (
                                <li key={p.id} className="py-2 flex justify-between text-sm">
                                    <span className="text-gray-500">{p.date}</span>
                                    <span className="font-medium">{p.liters}L ({p.sold}L sold @ {p.price})</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Feeds */}
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Record Feeds</h3>
                    <form className="mt-5 space-y-4" onSubmit={handleAddFeed}>
                        <input
                            type="date"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            value={feedDate}
                            onChange={(e) => setFeedDate(e.target.value)}
                        />
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            placeholder="Feed Type (e.g. Bran, Salt)"
                            value={feedType}
                            onChange={(e) => setFeedType(e.target.value)}
                        />
                        <input
                            type="number"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                            placeholder="Cost (KES)"
                            value={feedCost}
                            onChange={(e) => setFeedCost(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-full rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500"
                        >
                            Record Feed
                        </button>
                    </form>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900">Recent Feeds</h4>
                        <ul className="mt-2 divide-y divide-gray-200">
                            {feeds.slice(0, 5).map(f => (
                                <li key={f.id} className="py-2 flex justify-between text-sm">
                                    <span className="text-gray-500">{f.date}</span>
                                    <span className="font-medium">{f.type} - KES {f.cost}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
