import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Poultry() {
  const [flocks, setFlocks] = useState([])
  const [eggs, setEggs] = useState([])
  const [flockForm, setFlockForm] = useState({ breed: '', date_added: '', current_count: 0, mortality: 0, housing_unit: '' })
  const [eggForm, setEggForm] = useState({ flock_id: '', date_collected: '', quantity: 0, broken: 0, comments: '' })

  useEffect(() => {
    fetchFlocks()
    fetchEggs()
  }, [])

  const fetchFlocks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/poultry/flocks`)
      setFlocks(res.data)
    } catch (error) {
      console.error('Error fetching flocks:', error)
    }
  }

  const fetchEggs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/poultry/eggs`)
      setEggs(res.data)
    } catch (error) {
      console.error('Error fetching eggs:', error)
    }
  }

  const handleFlockSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/poultry/flocks`, flockForm)
      setFlockForm({ breed: '', date_added: '', current_count: 0, mortality: 0, housing_unit: '' })
      fetchFlocks()
    } catch (error) {
      console.error('Error adding flock:', error)
    }
  }

  const handleEggSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/poultry/eggs`, eggForm)
      setEggForm({ flock_id: '', date_collected: '', quantity: 0, broken: 0, comments: '' })
      fetchEggs()
    } catch (error) {
      console.error('Error adding egg record:', error)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Poultry Management</h1>
      
      <h2>Flocks</h2>
      <ul>
        {flocks.map(f => (
          <li key={f.id}>{f.breed} - Count: {f.current_count} - Mortality: {f.mortality}</li>
        ))}
      </ul>
      <form onSubmit={handleFlockSubmit}>
        <input type="text" placeholder="Breed" value={flockForm.breed} onChange={e => setFlockForm({...flockForm, breed: e.target.value})} required />
        <input type="date" value={flockForm.date_added} onChange={e => setFlockForm({...flockForm, date_added: e.target.value})} />
        <input type="number" placeholder="Current Count" value={flockForm.current_count} onChange={e => setFlockForm({...flockForm, current_count: parseInt(e.target.value)})} />
        <input type="number" placeholder="Mortality" value={flockForm.mortality} onChange={e => setFlockForm({...flockForm, mortality: parseInt(e.target.value)})} />
        <input type="text" placeholder="Housing Unit" value={flockForm.housing_unit} onChange={e => setFlockForm({...flockForm, housing_unit: e.target.value})} />
        <button type="submit">Add Flock</button>
      </form>

      <h2>Egg Production</h2>
      <ul>
        {eggs.map(e => (
          <li key={e.id}>Flock {e.flock_id} - {e.date_collected} - Qty: {e.quantity} - Broken: {e.broken}</li>
        ))}
      </ul>
      <form onSubmit={handleEggSubmit}>
        <input type="number" placeholder="Flock ID" value={eggForm.flock_id} onChange={e => setEggForm({...eggForm, flock_id: parseInt(e.target.value)})} required />
        <input type="date" value={eggForm.date_collected} onChange={e => setEggForm({...eggForm, date_collected: e.target.value})} required />
        <input type="number" placeholder="Quantity" value={eggForm.quantity} onChange={e => setEggForm({...eggForm, quantity: parseInt(e.target.value)})} required />
        <input type="number" placeholder="Broken" value={eggForm.broken} onChange={e => setEggForm({...eggForm, broken: parseInt(e.target.value)})} />
        <input type="text" placeholder="Comments" value={eggForm.comments} onChange={e => setEggForm({...eggForm, comments: e.target.value})} />
        <button type="submit">Add Egg Record</button>
      </form>
    </div>
  )
}