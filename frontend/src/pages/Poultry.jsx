import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

const FEED_TYPES = ['Growers', 'Finishers', 'Kienyeji']

export default function Poultry() {
    const [eggRecords, setEggRecords] = useState([])
    const [feedRecords, setFeedRecords] = useState([])
    const [activeTab, setActiveTab] = useState('eggs')

    // Egg form
    const [eggDate, setEggDate] = useState(new Date().toISOString().split('T')[0])
    const [eggCount, setEggCount] = useState('')

    // Feed form
    const [feedDate, setFeedDate] = useState(new Date().toISOString().split('T')[0])
    const [feedType, setFeedType] = useState('Growers')
    const [feedQuantity, setFeedQuantity] = useState('')
    const [feedCost, setFeedCost] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const eggs = await dbService.getAll('poultry')
        const feeds = await dbService.getAll('poultry_feeds')
        setEggRecords(eggs.sort((a, b) => new Date(b.date) - new Date(a.date)))
        setFeedRecords(feeds.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }

    const handleAddEggs = async (e) => {
        e.preventDefault()
        if (!eggCount) return

        await dbService.add('poultry', {
            date: eggDate,
            eggs: parseInt(eggCount),
            created_at: new Date()
        })

        setEggCount('')
        fetchData()
    }

    const handleAddFeed = async (e) => {
        e.preventDefault()
        if (!feedQuantity || !feedCost) return

        await dbService.add('poultry_feeds', {
            date: feedDate,
            feed_type: feedType,
            quantity: parseFloat(feedQuantity),
            cost: parseFloat(feedCost),
            created_at: new Date()
        })

        setFeedQuantity('')
        setFeedCost('')
        fetchData()
    }

    // Calculate monthly stats
    const currentMonth = new Date().getMonth()
    const monthlyEggs = eggRecords
        .filter(r => new Date(r.date).getMonth() === currentMonth)
        .reduce((sum, r) => sum + r.eggs, 0)

    const monthlyFeedCost = feedRecords
        .filter(r => new Date(r.date).getMonth() === currentMonth)
        .reduce((sum, r) => sum + r.cost, 0)

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-sm font-medium text-gray-500">Eggs This Month</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{monthlyEggs}</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-sm font-medium text-gray-500">Feed Cost This Month</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">KES {monthlyFeedCost.toLocaleString()}</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-sm font-medium text-gray-500">Avg Eggs/Day</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{Math.round(monthlyEggs / new Date().getDate())}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('eggs')}
                        className={`${activeTab === 'eggs' ? 'border-farm-600 text-farm-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                        🥚 Egg Production
                    </button>
                    <button
                        onClick={() => setActiveTab('feeds')}
                        className={`${activeTab === 'feeds' ? 'border-farm-600 text-farm-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                        🌾 Feeds
                    </button>
                </nav>
            </div>

            {/* Eggs Tab */}
            {activeTab === 'eggs' && (
                <>
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Record Egg Production</h3>
                            <form className="mt-5 sm:flex sm:items-center gap-2" onSubmit={handleAddEggs}>
                                <input
                                    type="date"
                                    value={eggDate}
                                    onChange={e => setEggDate(e.target.value)}
                                    className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                />
                                <input
                                    type="number"
                                    placeholder="Number of Eggs"
                                    value={eggCount}
                                    onChange={e => setEggCount(e.target.value)}
                                    className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-farm-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500"
                                >
                                    Record Eggs
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Records</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eggs Collected</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {eggRecords.slice(0, 30).map(record => (
                                    <tr key={record.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{record.eggs}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Feeds Tab */}
            {activeTab === 'feeds' && (
                <>
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Record Feed Purchase</h3>
                            <form className="mt-5 sm:flex sm:items-center sm:flex-wrap gap-2" onSubmit={handleAddFeed}>
                                <input
                                    type="date"
                                    value={feedDate}
                                    onChange={e => setFeedDate(e.target.value)}
                                    className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                />
                                <select
                                    value={feedType}
                                    onChange={e => setFeedType(e.target.value)}
                                    className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                >
                                    {FEED_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Quantity (Kg)"
                                    value={feedQuantity}
                                    onChange={e => setFeedQuantity(e.target.value)}
                                    className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                />
                                <input
                                    type="number"
                                    placeholder="Cost (KES)"
                                    value={feedCost}
                                    onChange={e => setFeedCost(e.target.value)}
                                    className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-farm-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500"
                                >
                                    Record Feed
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Feed Records</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feed Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity (Kg)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (KES)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {feedRecords.map(record => (
                                    <tr key={record.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.feed_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{record.cost.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
