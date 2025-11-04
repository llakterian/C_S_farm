import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function TeaPlucking() {
  const [records, setRecords] = useState([])
  const [staff, setStaff] = useState([])
  const [factories, setFactories] = useState([])
  const [form, setForm] = useState({ worker_id: '', factory_id: '', quantity: 0, date: '', comment: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
    fetchStaff()
    fetchFactories()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE}/teaplucking/`)
      setRecords(res.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tea plucking records:', error)
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${API_BASE}/staff/`)
      const teaWorkers = res.data.filter(s => s.pay_type === 'per_kilo')
      setStaff(teaWorkers)
    } catch (error) {
      console.error('Error fetching staff:', error)
    }
  }

  const fetchFactories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/factories/`)
      setFactories(res.data)
    } catch (error) {
      console.error('Error fetching factories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/teaplucking/`, {
        worker_id: parseInt(form.worker_id),
        factory_id: parseInt(form.factory_id),
        quantity: parseFloat(form.quantity),
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        comment: form.comment || null
      })
      setForm({ worker_id: '', factory_id: '', quantity: 0, date: '', comment: '' })
      fetchRecords()
    } catch (error) {
      console.error('Error adding tea plucking record:', error)
      alert('Error adding record. Please check your input.')
    }
  }

  const handleDelete = async (recordId) => {
    if (!window.confirm('Delete this tea plucking record?')) return
    
    try {
      await axios.delete(`${API_BASE}/teaplucking/${recordId}`)
      fetchRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const calculateTodayStats = () => {
    const today = new Date().toDateString()
    const todayRecords = records.filter(r => {
      const recordDate = new Date(r.date).toDateString()
      return recordDate === today
    })

    const totalKg = todayRecords.reduce((sum, r) => sum + r.quantity, 0)
    const totalGross = todayRecords.reduce((sum, r) => sum + (r.gross_amount || 0), 0)
    const totalNet = todayRecords.reduce((sum, r) => sum + (r.net_amount || 0), 0)

    return { totalKg, totalGross, totalNet, count: todayRecords.length }
  }

  const stats = calculateTodayStats()

  if (loading) {
    return <div className="farm-loading">Loading tea plucking records...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>🍃 Tea Plucking Management</h1>
        <p>Track daily tea plucking with factory rates and automatic payment calculations</p>
      </div>

      {/* Today's Summary */}
      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">Today's Production</div>
          <div className="farm-summary-value">{stats.totalKg.toFixed(1)} kg</div>
          <div className="farm-summary-label">{stats.count} records</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Gross Earnings</div>
          <div className="farm-summary-value">KES {stats.totalGross.toFixed(2)}</div>
          <div className="farm-summary-label">Before transport deduction</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Net Earnings</div>
          <div className="farm-summary-value">KES {stats.totalNet.toFixed(2)}</div>
          <div className="farm-summary-label">After transport deduction</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Records</div>
          <div className="farm-summary-value">{records.length}</div>
          <div className="farm-summary-label">All time</div>
        </div>
      </div>

      {/* Add New Record Form */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Add Tea Plucking Record</h2>
        </div>

        {staff.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">👥</div>
            <p>No tea plucking workers found.</p>
            <p>Please add staff members with pay type "per_kilo" first.</p>
          </div>
        ) : factories.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🏭</div>
            <p>No factories found.</p>
            <p>Please initialize factories first.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="farm-form">
            <div className="farm-form-group">
              <label className="farm-form-label">Worker</label>
              <select 
                className="farm-select"
                value={form.worker_id} 
                onChange={e => setForm({...form, worker_id: e.target.value})}
                required
              >
                <option value="">Select Worker</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Factory</label>
              <select 
                className="farm-select"
                value={form.factory_id} 
                onChange={e => setForm({...form, factory_id: e.target.value})}
                required
              >
                <option value="">Select Factory</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} - KES {f.rate_per_kg}/kg (Transport: KES {f.transport_deduction})
                  </option>
                ))}
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Quantity (kg)</label>
              <input
                className="farm-input"
                type="number"
                step="0.1"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={e => setForm({...form, quantity: e.target.value})}
                required
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Date</label>
              <input
                className="farm-input"
                type="date"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
              />
            </div>

            <div className="farm-form-group" style={{gridColumn: '1 / -1'}}>
              <label className="farm-form-label">Comment (optional)</label>
              <input
                className="farm-input"
                type="text"
                placeholder="Add any notes..."
                value={form.comment}
                onChange={e => setForm({...form, comment: e.target.value})}
              />
            </div>

            <div style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="farm-btn farm-btn-primary">
                ➕ Add Record
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Records Table */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Tea Plucking Records</h2>
        </div>

        {records.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🍃</div>
            <p>No tea plucking records yet.</p>
            <p>Add your first record using the form above.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Factory</th>
                  <th>Quantity (kg)</th>
                  <th>Rate/kg</th>
                  <th>Gross Amount</th>
                  <th>Transport</th>
                  <th>Net Amount</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}</td>
                    <td><strong>{r.worker_name || `Worker #${r.worker_id}`}</strong></td>
                    <td>
                      <span className="farm-badge farm-badge-info">
                        {r.factory_name || 'Not assigned'}
                      </span>
                    </td>
                    <td>{r.quantity.toFixed(1)}</td>
                    <td>KES {r.rate_per_kg ? r.rate_per_kg.toFixed(2) : 'N/A'}</td>
                    <td><strong>KES {r.gross_amount ? r.gross_amount.toFixed(2) : 'N/A'}</strong></td>
                    <td>KES {r.transport_deduction ? (r.quantity * r.transport_deduction).toFixed(2) : 'N/A'}</td>
                    <td>
                      <strong style={{color: 'var(--farm-green)'}}>
                        KES {r.net_amount ? r.net_amount.toFixed(2) : 'N/A'}
                      </strong>
                    </td>
                    <td>{r.comment || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(r.id)} 
                        className="farm-btn farm-btn-danger"
                        style={{padding: '0.4rem 0.8rem'}}
                      >
                        🗑️ Delete
                      </button>
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
