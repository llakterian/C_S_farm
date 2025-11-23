import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

export default function Labor() {
    const [workers, setWorkers] = useState([])
    const [logs, setLogs] = useState([])

    // Form state
    const [workerId, setWorkerId] = useState('')
    const [taskType, setTaskType] = useState('manual') // manual, dairy
    const [hours, setHours] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const w = await dbService.getAll('workers')
        const l = await dbService.getAll('labor_logs')
        setWorkers(w)
        setLogs(l.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!workerId || !hours) return

        await dbService.add('labor_logs', {
            worker_id: parseInt(workerId),
            task_type: taskType,
            hours: parseFloat(hours),
            date,
            created_at: new Date()
        })
        setHours('')
        fetchData()
    }

    const getWorkerName = (id) => workers.find(w => w.id === id)?.name || 'Unknown'

    return (
        <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Log Hourly Labor</h3>
                    <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <select
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                value={workerId}
                                onChange={(e) => setWorkerId(e.target.value)}
                            >
                                <option value="">Select Worker</option>
                                {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
                            </select>
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <select
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                value={taskType}
                                onChange={(e) => setTaskType(e.target.value)}
                            >
                                <option value="manual">Manual Labor (KES 216/hr)</option>
                                <option value="dairy">Dairy Labor (KES 233/hr)</option>
                            </select>
                        </div>
                        <div className="w-full sm:max-w-xs mr-2 mb-2">
                            <input
                                type="number"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                placeholder="Hours"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
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
                            Log Work
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Labor Logs</h3>
                </div>
                <div className="border-t border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Pay</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getWorkerName(log.worker_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{log.task_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.hours}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        KES {(log.hours * (log.task_type === 'dairy' ? 233 : 216)).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
