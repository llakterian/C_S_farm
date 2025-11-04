import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ name: '', role: '', pay_type: 'monthly', pay_rate: 0 })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${API_BASE}/staff/`)
      setStaff(res.data)
    } catch (error) {
      console.error('Error fetching staff:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/staff/`, form)
      setForm({ name: '', role: '', pay_type: 'monthly', pay_rate: 0 })
      fetchStaff()
    } catch (error) {
      console.error('Error adding staff:', error)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Staff Management</h1>
      <h2>Staff List</h2>
      <ul>
        {staff.map(s => (
          <li key={s.id}>{s.name} - {s.role} - {s.pay_type} - {s.pay_rate}</li>
        ))}
      </ul>
      <h2>Add Staff</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Role"
          value={form.role}
          onChange={e => setForm({...form, role: e.target.value})}
          required
        />
        <select
          value={form.pay_type}
          onChange={e => setForm({...form, pay_type: e.target.value})}
        >
          <option value="monthly">Monthly</option>
          <option value="per_kilo">Per Kilo</option>
        </select>
        <input
          type="number"
          placeholder="Pay Rate"
          value={form.pay_rate}
          onChange={e => setForm({...form, pay_rate: parseFloat(e.target.value)})}
          required
        />
        <button type="submit">Add Staff</button>
      </form>
    </div>
  )
}