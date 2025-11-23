import { useState, useEffect } from 'react'
import { dbService } from '../services/db'

export default function Livestock() {
    const [cows, setCows] = useState([])
    const [aiServices, setAiServices] = useState([])
    const [calvings, setCalvings] = useState([])
    const [activeTab, setActiveTab] = useState('cows')

    // Cow form
    const [cowName, setCowName] = useState('')
    const [cowTag, setCowTag] = useState('')
    const [cowStatus, setCowStatus] = useState('Milking')
    const [cowBreed, setCowBreed] = useState('Friesian')
    const [cowDob, setCowDob] = useState('')

    // AI form
    const [aiCowId, setAiCowId] = useState('')
    const [aiDate, setAiDate] = useState(new Date().toISOString().split('T')[0])
    const [aiVet, setAiVet] = useState('')
    const [aiCost, setAiCost] = useState('')

    // Calving form
    const [calvingCowId, setCalvingCowId] = useState('')
    const [calvingDate, setCalvingDate] = useState(new Date().toISOString().split('T')[0])
    const [calfGender, setCalfGender] = useState('Female')
    const [calfStatus, setCalfStatus] = useState('Alive')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const c = await dbService.getAll('cows')
        const a = await dbService.getAll('ai_services')
        const cal = await dbService.getAll('calvings')
        setCows(c)
        setAiServices(a.sort((a, b) => new Date(b.date) - new Date(a.date)))
        setCalvings(cal.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }

    const handleAddCow = async (e) => {
        e.preventDefault()
        if (!cowName || !cowTag) return

        await dbService.add('cows', {
            name: cowName,
            tag: cowTag,
            status: cowStatus,
            breed: cowBreed,
            dob: cowDob,
            notes: '',
            created_at: new Date()
        })

        setCowName('')
        setCowTag('')
        setCowDob('')
        fetchData()
    }

    const handleAddAI = async (e) => {
        e.preventDefault()
        if (!aiCowId) return

        await dbService.add('ai_services', {
            cow_id: parseInt(aiCowId),
            date: aiDate,
            vet: aiVet,
            cost: parseFloat(aiCost) || 0,
            expected_calving: calculateExpectedCalving(aiDate),
            created_at: new Date()
        })

        setAiCowId('')
        setAiVet('')
        setAiCost('')
        fetchData()
    }

    const handleAddCalving = async (e) => {
        e.preventDefault()
        if (!calvingCowId) return

        await dbService.add('calvings', {
            cow_id: parseInt(calvingCowId),
            date: calvingDate,
            calf_gender: calfGender,
            calf_status: calfStatus,
            notes: '',
            created_at: new Date()
        })

        // Update cow status back to milking
        const cow = cows.find(c => c.id === parseInt(calvingCowId))
        if (cow) {
            await dbService.put('cows', { ...cow, status: 'Milking' })
        }

        setCalvingCowId('')
        fetchData()
    }

    const calculateExpectedCalving = (aiDate) => {
        const date = new Date(aiDate)
        date.setDate(date.getDate() + 283) // Average gestation: 283 days
        return date.toISOString().split('T')[0]
    }

    const getCowName = (id) => cows.find(c => c.id === id)?.name || 'Unknown'

    const getDaysPregnant = (aiDate) => {
        const today = new Date()
        const ai = new Date(aiDate)
        const days = Math.floor((today - ai) / (1000 * 60 * 60 * 24))
        return days
    }

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('cows')}
                        className={`${activeTab === 'cows' ? 'border-farm-600 text-farm-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                        🐄 Cows ({cows.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`${activeTab === 'ai' ? 'border-farm-600 text-farm-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                        💉 AI Services
                    </button>
                    <button
                        onClick={() => setActiveTab('calvings')}
                        className={`${activeTab === 'calvings' ? 'border-farm-600 text-farm-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                        🍼 Calvings
                    </button>
                </nav>
            </div>

            {/* Cows Tab */}
            {activeTab === 'cows' && (
                <>
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Add Cow</h3>
                            <form className="mt-5 sm:flex sm:items-center sm:flex-wrap gap-2" onSubmit={handleAddCow}>
                                <input type="text" placeholder="Name" value={cowName} onChange={e => setCowName(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6" />
                                <input type="text" placeholder="Tag (e.g., C001)" value={cowTag} onChange={e => setCowTag(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6" />
                                <select value={cowStatus} onChange={e => setCowStatus(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6">
                                    <option value="Milking">Milking</option>
                                    <option value="Pregnant">Pregnant</option>
                                    <option value="Dry">Dry</option>
                                    <option value="Calf">Calf</option>
                                </select>
                                <input type="text" placeholder="Breed" value={cowBreed} onChange={e => setCowBreed(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6" />
                                <input type="date" placeholder="Date of Birth" value={cowDob} onChange={e => setCowDob(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6" />
                                <button type="submit" className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-farm-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500">Add Cow</button>
                            </form>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cows.map(cow => (
                            <div key={cow.id} className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{cow.name}</h4>
                                        <p className="text-sm text-gray-500">Tag: {cow.tag}</p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cow.status === 'Milking' ? 'bg-green-100 text-green-800' : cow.status === 'Pregnant' ? 'bg-yellow-100 text-yellow-800' : cow.status === 'Calf' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {cow.status}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-1 text-sm text-gray-600">
                                    <div>Breed: {cow.breed}</div>
                                    <div>DOB: {cow.dob}</div>
                                    {cow.notes && <div className="text-xs italic">{cow.notes}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* AI Services Tab */}
            {activeTab === 'ai' && (
                <>
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Record AI Service</h3>
                            <form className="mt-5 sm:flex sm:items-center sm:flex-wrap gap-2" onSubmit={handleAddAI}>
                                <select value={aiCowId} onChange={e => setAiCowId(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6">
                                    <option value="">Select Cow</option>
                                    {cows.filter(c => c.status === 'Milking' || c.status === 'Dry').map(c => <option key={c.id} value={c.id}>{c.name} ({c.tag})</option>)}
                                </select>
                                <input type="date" value={aiDate} onChange={e => setAiDate(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6" />
                                <input type="text" placeholder="Vet Name" value={aiVet} onChange={e => setAiVet(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6" />
                                <input type="number" placeholder="Cost (KES)" value={aiCost} onChange={e => setAiCost(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6" />
                                <button type="submit" className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-farm-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500">Record AI</button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cow</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Pregnant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Calving</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {aiServices.map(ai => {
                                    const daysPreg = getDaysPregnant(ai.date)
                                    return (
                                        <tr key={ai.id} className={daysPreg > 270 ? 'bg-yellow-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getCowName(ai.cow_id)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ai.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{daysPreg} days</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ai.expected_calving}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ai.vet}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ai.cost}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Calvings Tab */}
            {activeTab === 'calvings' && (
                <>
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Record Calving</h3>
                            <form className="mt-5 sm:flex sm:items-center sm:flex-wrap gap-2" onSubmit={handleAddCalving}>
                                <select value={calvingCowId} onChange={e => setCalvingCowId(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6">
                                    <option value="">Select Cow</option>
                                    {cows.filter(c => c.status === 'Pregnant').map(c => <option key={c.id} value={c.id}>{c.name} ({c.tag})</option>)}
                                </select>
                                <input type="date" value={calvingDate} onChange={e => setCalvingDate(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6" />
                                <select value={calfGender} onChange={e => setCalfGender(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6">
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                                <select value={calfStatus} onChange={e => setCalfStatus(e.target.value)} className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-farm-600 sm:text-sm sm:leading-6">
                                    <option value="Alive">Alive</option>
                                    <option value="Stillborn">Stillborn</option>
                                </select>
                                <button type="submit" className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-farm-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500">Record Calving</button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cow</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calving Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calf Gender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {calvings.map(calving => (
                                    <tr key={calving.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getCowName(calving.cow_id)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calving.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calving.calf_gender}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calving.calf_status}</td>
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
