import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Advances() {
  const [advances, setAdvances] = useState([])
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({
    worker_id: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    date: '',
    notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchAdvances()
    fetchStaff()
  }, [])

  const fetchAdvances = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/advances/`)
      setAdvances(res.data)
    } catch (error) {
      console.error('Error fetching advances:', error)
    } finally {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/advances/`, {
        worker_id: parseInt(form.worker_id),
        amount: parseFloat(form.amount),
        month: parseInt(form.month),
        year: parseInt(form.year),
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        deducted: false,
        notes: form.notes || null
      })
      setForm({
        worker_id: '',
        amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        date: '',
        notes: ''
      })
      fetchAdvances()
      alert('Advance recorded successfully!')
    } catch (error) {
      console.error('Error adding advance:', error)
      alert('Error recording advance. Please check your input.')
    }
  }

  const handleDelete = async (advanceId) => {
    if (!window.confirm('Delete this advance?')) return
    
    try {
      await axios.delete(`${API_BASE}/advances/${advanceId}`)
      fetchAdvances()
    } catch (error) {
      console.error('Error deleting advance:', error)
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const filteredAdvances = advances.filter(a => 
    a.month === filterMonth && a.year === filterYear
  )

  const calculateStats = () => {
    const total = filteredAdvances.reduce((sum, a) => sum + (a.amount || 0), 0)
    const pending = filteredAdvances.filter(a => !a.deducted).reduce((sum, a) => sum + (a.amount || 0), 0)
    const deducted = filteredAdvances.filter(a => a.deducted).reduce((sum, a) => sum + (a.amount || 0), 0)

    return { total, pending, deducted, count: filteredAdvances.length }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="farm-loading">Loading advances data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>💵 Worker Advances</h1>
        <p>Track money advances given to workers (deducted from monthly payroll)</p>
      </div>

      {/* Filter Section */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📅 Filter by Period</h2>
        </div>
        
        <div className="farm-form" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
          <div className="farm-form-group">
            <label className="farm-form-label">Month</label>
            <select 
              className="farm-select"
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Year</label>
            <input
              className="farm-input"
              type="number"
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              min="2020"
              max="2030"
            />
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Advances</div>
          <div className="farm-summary-value">{stats.count}</div>
          <div className="farm-summary-label">This period</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Amount</div>
          <div className="farm-summary-value">KES {stats.total.toFixed(2)}</div>
          <div className="farm-summary-label">All advances</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Pending</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-brown)'}}>
            KES {stats.pending.toFixed(2)}
          </div>
          <div className="farm-summary-label">Not yet deducted</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Deducted</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>
            KES {stats.deducted.toFixed(2)}
          </div>
          <div className="farm-summary-label">From payroll</div>
        </div>
      </div>

      {/* Add Advance Form */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Record Worker Advance</h2>
        </div>

        {staff.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">👥</div>
            <p>No tea plucking workers found.</p>
            <p>Please add staff members with pay type "per_kilo" first.</p>
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
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Amount (KES)</label>
              <input
                className="farm-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                required
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Deduct from Month</label>
              <select 
                className="farm-select"
                value={form.month}
                onChange={e => setForm({...form, month: e.target.value})}
                required
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Year</label>
              <input
                className="farm-input"
                type="number"
                value={form.year}
                onChange={e => setForm({...form, year: e.target.value})}
                min="2020"
                max="2030"
                required
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Date Given</label>
              <input
                className="farm-input"
                type="date"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
              />
            </div>

            <div className="farm-form-group" style={{gridColumn: '1 / -1'}}>
              <label className="farm-form-label">Notes (optional)</label>
              <input
                className="farm-input"
                type="text"
                placeholder="Add any notes about this advance..."
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
              />
            </div>

            <div style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="farm-btn farm-btn-primary">
                ➕ Record Advance
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Advances Table */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">
            📋 Advances for {months[filterMonth - 1]} {filterYear}
          </h2>
        </div>

        {filteredAdvances.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">💵</div>
            <p>No advances for this period.</p>
            <p>Record advances using the form above.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Date Given</th>
                  <th>Worker</th>
                  <th>Amount</th>
                  <th>Deduct From</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvances.map(a => (
                  <tr key={a.id}>
                    <td>{a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</td>
                    <td><strong>{a.worker_name || `Worker #${a.worker_id}`}</strong></td>
                    <td>
                      <strong style={{color: 'var(--farm-brown)'}}>
                        KES {a.amount?.toFixed(2) || 0}
                      </strong>
                    </td>
                    <td>
                      <span className="farm-badge farm-badge-info">
                        {months[a.month - 1]} {a.year}
                      </span>
                    </td>
                    <td>
                      <span className={`farm-badge ${
                        a.deducted ? 'farm-badge-success' : 'farm-badge-warning'
                      }`}>
                        {a.deducted ? '✓ Deducted' : 'Pending'}
                      </span>
                    </td>
                    <td>{a.notes || '-'}</td>
                    <td>
                      {!a.deducted && (
                        <button 
                          onClick={() => handleDelete(a.id)}
                          className="farm-btn farm-btn-danger"
                          style={{padding: '0.3rem 0.6rem', fontSize: '0.85rem'}}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{backgroundColor: 'var(--farm-cream)', fontWeight: 'bold'}}>
                <tr>
                  <td colSpan="2">TOTALS</td>
                  <td>KES {stats.total.toFixed(2)}</td>
                  <td colSpan="4">
                    Pending: KES {stats.pending.toFixed(2)} | 
                    Deducted: KES {stats.deducted.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="farm-card" style={{background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'}}>
        <h3 style={{color: 'var(--farm-green)', marginBottom: '1rem'}}>ℹ️ How Worker Advances Work</h3>
        <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
          <li><strong>Recording:</strong> When you give a worker money during the month, record it as an advance</li>
          <li><strong>Deduction Month:</strong> Specify which month's payroll the advance should be deducted from</li>
          <li><strong>Automatic Deduction:</strong> When you calculate monthly payroll, all pending advances for that month are automatically deducted</li>
          <li><strong>Status Tracking:</strong> System tracks which advances have been deducted and which are still pending</li>
          <li><strong>Payroll Integration:</strong> Net pay = Gross earnings - Advances</li>
        </ul>
      </div>
    </div>
  )
}
