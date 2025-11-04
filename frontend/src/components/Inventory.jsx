import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ item_name: '', quantity: 0, unit: '', category: '', notes: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/inventory/`)
      setItems(res.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/inventory/`, {
        ...form,
        quantity: parseFloat(form.quantity)
      })
      setForm({ item_name: '', quantity: 0, unit: '', category: '', notes: '' })
      fetchItems()
      alert('Inventory item added successfully!')
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await axios.delete(`${API_BASE}/inventory/${id}`)
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  if (loading) return <div className="farm-loading">Loading inventory...</div>

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>📦 Inventory Management</h1>
        <p>Track farm supplies and equipment</p>
      </div>

      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Items</div>
          <div className="farm-summary-value">{items.length}</div>
          <div className="farm-summary-label">In inventory</div>
        </div>
      </div>

      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Add Inventory Item</h2>
        </div>
        <form onSubmit={handleSubmit} className="farm-form">
          <div className="farm-form-group">
            <label className="farm-form-label">Item Name</label>
            <input className="farm-input" type="text" placeholder="e.g., Fertilizer, Tools" value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} required />
          </div>
          <div className="farm-form-group">
            <label className="farm-form-label">Quantity</label>
            <input className="farm-input" type="number" step="0.1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
          </div>
          <div className="farm-form-group">
            <label className="farm-form-label">Unit</label>
            <input className="farm-input" type="text" placeholder="kg, bags, pieces" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} required />
          </div>
          <div className="farm-form-group">
            <label className="farm-form-label">Category</label>
            <select className="farm-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="">Select Category</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="tools">Tools & Equipment</option>
              <option value="feed">Animal Feed</option>
              <option value="seeds">Seeds & Seedlings</option>
              <option value="chemicals">Chemicals & Pesticides</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="farm-form-group" style={{gridColumn: '1 / -1'}}>
            <label className="farm-form-label">Notes</label>
            <input className="farm-input" type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <button type="submit" className="farm-btn farm-btn-primary">➕ Add Item</button>
          </div>
        </form>
      </div>

      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Inventory Items</h2>
        </div>
        {items.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">📦</div>
            <p>No items in inventory yet.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr><th>Item</th><th>Quantity</th><th>Unit</th><th>Category</th><th>Notes</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.item_name}</strong></td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td><span className="farm-badge farm-badge-info">{item.category || 'N/A'}</span></td>
                    <td>{item.notes || '-'}</td>
                    <td>
                      <button onClick={() => handleDelete(item.id)} className="farm-btn farm-btn-danger" style={{padding: '0.4rem 0.8rem'}}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
