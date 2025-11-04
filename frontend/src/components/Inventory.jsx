import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', quantity: 0, unit: 'kg', category: '' })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/inventory/`)
      setItems(res.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/inventory/`, form)
      setForm({ name: '', quantity: 0, unit: 'kg', category: '' })
      fetchItems()
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Inventory</h1>
      <h2>Items</h2>
      <ul>
        {items.map(i => (
          <li key={i.id}>{i.name} - {i.quantity} {i.unit} - {i.category}</li>
        ))}
      </ul>
      <h2>Add Item</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm({...form, quantity: parseFloat(e.target.value)})}
          required
        />
        <input
          type="text"
          placeholder="Unit"
          value={form.unit}
          onChange={e => setForm({...form, unit: e.target.value})}
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({...form, category: e.target.value})}
        />
        <button type="submit">Add Item</button>
      </form>
    </div>
  )
}