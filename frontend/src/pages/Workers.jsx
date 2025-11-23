import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

const ROLES = ['Plucker', 'Dairy', 'Watchman', 'Supervisor', 'Casual']

export default function Workers() {
    const [workers, setWorkers] = useState([])
    const [newName, setNewName] = useState('')
    const [newPhone, setNewPhone] = useState('')
    const [newRole, setNewRole] = useState('Plucker')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchWorkers()
    }, [])

    const fetchWorkers = async () => {
        const data = await dbService.getAll('workers')
        setWorkers(data)
    }

    const handleAddWorker = async (e) => {
        e.preventDefault()
        await dbService.add('workers', {
            name: newName,
            phone: newPhone,
            role: newRole
        })
        setNewName('')
        setNewPhone('')
        setNewRole('Plucker')
        setIsModalOpen(false)
        fetchWorkers()
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Workers</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage your farm workers and their roles.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="block rounded-md bg-farm-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-farm-500"
                    >
                        Add Worker
                    </button>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {workers.map((worker) => (
                                    <tr key={worker.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{worker.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {worker.role || 'Plucker'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{worker.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Add Worker</h3>
                            <div className="mt-2 space-y-3">
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                    placeholder="Name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <select
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                >
                                    {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                    placeholder="Phone"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                />
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                <button
                                    type="button"
                                    className="inline-flex w-full justify-center rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500 sm:col-start-2"
                                    onClick={handleAddWorker}
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
