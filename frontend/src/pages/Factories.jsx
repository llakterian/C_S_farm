import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

export default function Factories() {
    const [factories, setFactories] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingFactory, setEditingFactory] = useState(null)

    // Form state
    const [name, setName] = useState('')
    const [rate, setRate] = useState('')
    const [transport, setTransport] = useState('')

    useEffect(() => {
        fetchFactories()
    }, [])

    const fetchFactories = async () => {
        const data = await dbService.getAll('factories')
        setFactories(data)
    }

    const handleEdit = (factory) => {
        setEditingFactory(factory)
        setName(factory.name)
        setRate(factory.rate)
        setTransport(factory.transport)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (editingFactory) {
            await dbService.put('factories', {
                ...editingFactory,
                name,
                rate: parseFloat(rate),
                transport: parseFloat(transport)
            })
        } else {
            await dbService.add('factories', {
                name,
                rate: parseFloat(rate),
                transport: parseFloat(transport)
            })
        }
        setIsModalOpen(false)
        setEditingFactory(null)
        setName('')
        setRate('')
        setTransport('')
        fetchFactories()
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Factories</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage factory rates and transport costs.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={() => {
                            setEditingFactory(null);
                            setName('');
                            setRate('');
                            setTransport('');
                            setIsModalOpen(true);
                        }}
                        className="block rounded-md bg-farm-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-farm-500"
                    >
                        Add Factory
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
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rate (KES/Kg)</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Transport (KES/Kg)</th>
                                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {factories.map((factory) => (
                                    <tr key={factory.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{factory.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{factory.rate}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{factory.transport}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button onClick={() => handleEdit(factory)} className="text-farm-600 hover:text-farm-900">Edit</button>
                                        </td>
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
                            <h3 className="text-base font-semibold leading-6 text-gray-900">{editingFactory ? 'Edit Factory' : 'Add Factory'}</h3>
                            <div className="mt-2 space-y-3">
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                    placeholder="Rate (KES)"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                />
                                <input
                                    type="number"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                    placeholder="Transport Cost (KES)"
                                    value={transport}
                                    onChange={(e) => setTransport(e.target.value)}
                                />
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                <button
                                    type="button"
                                    className="inline-flex w-full justify-center rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500 sm:col-start-2"
                                    onClick={handleSave}
                                >
                                    Save
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
