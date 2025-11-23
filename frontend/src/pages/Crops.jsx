import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import api from '../api'

export default function Crops() {
    const [crops, setCrops] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newCropName, setNewCropName] = useState('')

    useEffect(() => {
        fetchCrops()
    }, [])

    const fetchCrops = async () => {
        try {
            const response = await api.get('/crops/')
            setCrops(response.data || [])
        } catch (error) {
            console.error('Failed to fetch crops', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddCrop = async (e) => {
        e.preventDefault()
        try {
            await api.post('/crops/', { name: newCropName, status: 'Planted' })
            setNewCropName('')
            setIsModalOpen(false)
            fetchCrops()
        } catch (error) {
            console.error('Failed to add crop', error)
        }
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Crops</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all the crops in your farm including their name, status, and planting date.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="block rounded-md bg-farm-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-farm-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-farm-600"
                    >
                        Add Crop
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Planted
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {crops.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-gray-500">No crops added yet.</td>
                                        </tr>
                                    ) : (
                                        crops.map((crop) => (
                                            <tr key={crop.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {crop.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{crop.status}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {crop.created_at ? new Date(crop.created_at).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <a href="#" className="text-farm-600 hover:text-farm-900">
                                                        Edit<span className="sr-only">, {crop.name}</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                <div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Add New Crop</h3>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6"
                                                placeholder="Crop Name (e.g. Maize)"
                                                value={newCropName}
                                                onChange={(e) => setNewCropName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-farm-600 sm:col-start-2"
                                        onClick={handleAddCrop}
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
                </div>
            )}
        </div>
    )
}
