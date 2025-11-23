import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

export default function Plucking() {
    const [workers, setWorkers] = useState([])
    const [factories, setFactories] = useState([])
    const [records, setRecords] = useState([])

    // Form state
    const [workerId, setWorkerId] = useState('')
    const [factoryId, setFactoryId] = useState('')
    const [weight, setWeight] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const w = await dbService.getAll('workers')
        const f = await dbService.getAll('factories')
        const r = await dbService.getAll('tea_plucking')
        setWorkers(w)
        setFactories(f)
        setRecords(r.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!workerId || !factoryId || !weight) return

        const record = {
            worker_id: parseInt(workerId),
            factory_id: parseInt(factoryId),
            weight: parseFloat(weight),
            date,
            created_at: new Date()
        }

        await dbService.add('tea_plucking', record)
        setWeight('')
        fetchData()
    }

    const getWorkerName = (id) => workers.find(w => w.id === id)?.name || 'Unknown'
    const getFactoryName = (id) => factories.find(f => f.id === id)?.name || 'Unknown'

    return (
        <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Record Tea Plucking</h3>
                    <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <label htmlFor="worker" className="sr-only">Worker</label>
                            <select
                                id="worker"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                value={workerId}
                                onChange={(e) => setWorkerId(e.target.value)}
                            >
                                <option value="">Select Worker</option>
                                {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role || 'Plucker'})</option>)}
                            </select>
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <label htmlFor="factory" className="sr-only">Factory</label>
                            <select
                                id="factory"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                value={factoryId}
                                onChange={(e) => setFactoryId(e.target.value)}
                            >
                                <option value="">Select Factory</option>
                                {factories.map(f => <option key={f.id} value={f.id}>{f.name} ({f.rate}/kg)</option>)}
                            </select>
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <label htmlFor="weight" className="sr-only">Weight (Kg)</label>
                            <input
                                type="number"
                                id="weight"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                placeholder="Weight (Kg)"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <input
                                type="date"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500 sm:ml-3 sm:mt-0 sm:w-auto"
                        >
                            Save
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Records</h3>
                </div>
                <div className="border-t border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (Kg)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {records.map((record) => (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getWorkerName(record.worker_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getFactoryName(record.factory_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
