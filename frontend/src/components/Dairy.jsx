import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Dairy() {
  const [cows, setCows] = useState([])
  const [milk, setMilk] = useState([])
  const [cowForm, setCowForm] = useState({ tag_no: '', breed: '', lactation_no: 0, age: 0, status: 'active' })
  const [milkForm, setMilkForm] = useState({ cow_id: '', date_recorded: '', quantity: 0, notes: '' })

  useEffect(() => {
    fetchCows()
    fetchMilk()
  }, [])

  const fetchCows = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dairy/cows`)
      setCows(res.data)
    } catch (error) {
      console.error('Error fetching cows:', error)
    }
  }

  const fetchMilk = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dairy/milk`)
      setMilk(res.data)
    } catch (error) {
      console.error('Error fetching milk:', error)
    }
  }

  const handleCowSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/dairy/cows`, cowForm)
      setCowForm({ tag_no: '', breed: '', lactation_no: 0, age: 0, status: 'active' })
      fetchCows()
    } catch (error) {
      console.error('Error adding cow:', error)
    }
  }

  const handleMilkSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/dairy/milk`, milkForm)
      setMilkForm({ cow_id: '', date_recorded: '', quantity: 0, notes: '' })
      fetchMilk()
    } catch (error) {
      console.error('Error adding milk record:', error)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Dairy Management</h1>
      
      <h2>Cows</h2>
      <ul>
        {cows.map(c => (
          <li key={c.id}>{c.tag_no} - {c.breed} - Lactation: {c.lactation_no} - Status: {c.status}</li>
        ))}
      </ul>
      <form onSubmit={handleCowSubmit}>
        <input type="text" placeholder="Tag No" value={cowForm.tag_no} onChange={e => setCowForm({...cowForm, tag_no: e.target.value})} required />
        <input type="text" placeholder="Breed" value={cowForm.breed} onChange={e => setCowForm({...cowForm, breed: e.target.value})} />
        <input type="number" placeholder="Lactation No" value={cowForm.lactation_no} onChange={e => setCowForm({...cowForm, lactation_no: parseInt(e.target.value)})} />
        <input type="number" placeholder="Age" value={cowForm.age} onChange={e => setCowForm({...cowForm, age: parseInt(e.target.value)})} />
        <select value={cowForm.status} onChange={e => setCowForm({...cowForm, status: e.target.value})}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit">Add Cow</button>
      </form>

      <h2>Milk Records</h2>
      <ul>
        {milk.map(m => (
          <li key={m.id}>Cow {m.cow_id} - {m.date_recorded} - Qty: {m.quantity}L</li>
        ))}
      </ul>
      <form onSubmit={handleMilkSubmit}>
        <input type="number" placeholder="Cow ID" value={milkForm.cow_id} onChange={e => setMilkForm({...milkForm, cow_id: parseInt(e.target.value)})} required />
        <input type="date" value={milkForm.date_recorded} onChange={e => setMilkForm({...milkForm, date_recorded: e.target.value})} required />
        <input type="number" step="0.1" placeholder="Quantity (L)" value={milkForm.quantity} onChange={e => setMilkForm({...milkForm, quantity: parseFloat(e.target.value)})} required />
        <input type="text" placeholder="Notes" value={milkForm.notes} onChange={e => setMilkForm({...milkForm, notes: e.target.value})} />
        <button type="submit">Add Milk Record</button>
      </form>
    </div>
  )
}