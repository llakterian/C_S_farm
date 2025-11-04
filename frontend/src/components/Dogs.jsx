import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Dogs() {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({ type: 'feeding', quantity: 0, date: '', notes: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/dogs/`)
      setRecords(res.data)
    } catch (error) {
      console.error('Error fetching dog records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/dogs/`, {
        ...form,
        quantity: parseFloat(form.quantity),
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString()
      })
      setForm({ type: 'feeding', quantity: 0, date: '', notes: '' })
      fetchRecords()
      alert('Dog record added successfully!')
    } catch (error) {
      console.error('Error adding record:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      await axios.delete(`${API_BASE}/dogs/${id}`)
      fetchRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  if (loading) return <div className="farm-loading">Loading dog records...</div>

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>🐕 Dog Management</h1>
        <p>Track guard dog activities and care</p>
      </div>

      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Records</div>
          <div className="farm-summary-value">{records.length}</div>
          <div className="farm-summary-label">All activities</div>
        </div>
      </div>

      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Add Dog Activity</h2>
        </div>
        <form onSubmit={handleSubmit} className="farm-form">
          <div className="farm-form-group">
            <label className="farm-form-label">Type</label>
            <select className="farm-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="feeding">Feeding</option>
              <option value="vet">Veterinary Visit</option>
              <option value="training">Training</option>
              <option value="grooming">Grooming</option>
            </select>
          </div>
          <div className="farm-form-group">
            <label className="farm-form-label">Quantity/Cost</label>
            <input className="farm-input" type="number" step="0.1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
          </div>
          <div className="farm-form-group">
            <label className="farm-form-label">Date</label>
            <input className="farm-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="farm-form-group" style={{gridColumn: '1 / -1'}}>
            <label className="farm-form-label">Notes</label>
            <input className="farm-input" type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <button type="submit" className="farm-btn farm-btn-primary">➕ Add Record</button>
          </div>
        </form>
      </div>

      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Dog Records</h2>
        </div>
        {records.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🐕</div>
            <p>No dog records yet.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Amount</th><th>Notes</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td><span className="farm-badge farm-badge-warning">{r.type}</span></td>
                    <td><strong>{r.quantity}</strong></td>
                    <td>{r.notes || '-'}</td>
                    <td>
                      <button onClick={() => handleDelete(r.id)} className="farm-btn farm-btn-danger" style={{padding: '0.4rem 0.8rem'}}>🗑️</button>
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
