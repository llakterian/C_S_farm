import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Fertilizer() {
  const [transactions, setTransactions] = useState([])
  const [staff, setStaff] = useState([])
  const [factories, setFactories] = useState([])
  const [form, setForm] = useState({
    worker_id: '',
    factory_id: '',
    quantity: 0,
    cost_per_unit: 0,
    deduction_type: 'monthly',
    date: '',
    notes: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
    fetchStaff()
    fetchFactories()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/fertilizer/`)
      setTransactions(res.data)
    } catch (error) {
      console.error('Error fetching fertilizer transactions:', error)
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
      await axios.post(`${API_BASE}/fertilizer/`, {
        worker_id: parseInt(form.worker_id),
        factory_id: parseInt(form.factory_id),
        quantity: parseFloat(form.quantity),
        cost_per_unit: parseFloat(form.cost_per_unit),
        deduction_type: form.deduction_type,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        notes: form.notes || null
      })
      setForm({
        worker_id: '',
        factory_id: '',
        quantity: 0,
        cost_per_unit: 0,
        deduction_type: 'monthly',
        date: '',
        notes: ''
      })
      fetchTransactions()
      alert('Fertilizer transaction added successfully!')
    } catch (error) {
      console.error('Error adding fertilizer transaction:', error)
      alert('Error adding transaction. Please check your input.')
    }
  }

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Delete this fertilizer transaction?')) return
    
    try {
      await axios.delete(`${API_BASE}/fertilizer/${transactionId}`)
      fetchTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const updateStatus = async (transactionId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/fertilizer/${transactionId}`, { status: newStatus })
      fetchTransactions()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const calculateStats = () => {
    const totalAmount = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.total_amount || 0), 0)
    const completedAmount = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.total_amount || 0), 0)

    return { totalAmount, pendingAmount, completedAmount, count: transactions.length }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="farm-loading">Loading fertilizer data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>🌱 Fertilizer Management</h1>
        <p>Track fertilizer distribution and automatic payroll deductions</p>
      </div>

      {/* Summary Statistics */}
      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Transactions</div>
          <div className="farm-summary-value">{stats.count}</div>
          <div className="farm-summary-label">All time</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Value</div>
          <div className="farm-summary-value">KES {stats.totalAmount.toFixed(2)}</div>
          <div className="farm-summary-label">All fertilizer</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Pending Deductions</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-brown)'}}>
            KES {stats.pendingAmount.toFixed(2)}
          </div>
          <div className="farm-summary-label">To be deducted</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Completed</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>
            KES {stats.completedAmount.toFixed(2)}
          </div>
          <div className="farm-summary-label">Already deducted</div>
        </div>
      </div>

      {/* Add Fertilizer Transaction Form */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Record Fertilizer Distribution</h2>
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
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Factory/Supplier</label>
              <select 
                className="farm-select"
                value={form.factory_id} 
                onChange={e => setForm({...form, factory_id: e.target.value})}
                required
              >
                <option value="">Select Factory</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Quantity (kg or bags)</label>
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
              <label className="farm-form-label">Cost per Unit (KES)</label>
              <input
                className="farm-input"
                type="number"
                step="0.01"
                placeholder="Cost per kg/bag"
                value={form.cost_per_unit}
                onChange={e => setForm({...form, cost_per_unit: e.target.value})}
                required
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Deduction Type</label>
              <select 
                className="farm-select"
                value={form.deduction_type}
                onChange={e => setForm({...form, deduction_type: e.target.value})}
              >
                <option value="monthly">Monthly Deduction</option>
                <option value="annual_bonus">Deduct from Annual Bonus</option>
                <option value="immediate">Immediate Deduction</option>
              </select>
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
              <label className="farm-form-label">Notes (optional)</label>
              <input
                className="farm-input"
                type="text"
                placeholder="Add any notes about this fertilizer..."
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
              />
            </div>

            <div style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="farm-btn farm-btn-primary">
                ➕ Add Transaction
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Fertilizer Transactions Table */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Fertilizer Transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🌱</div>
            <p>No fertilizer transactions yet.</p>
            <p>Add your first transaction using the form above.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>Factory</th>
                  <th>Quantity</th>
                  <th>Cost/Unit</th>
                  <th>Total Amount</th>
                  <th>Deduction Type</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                    <td><strong>{t.worker_id ? `Worker #${t.worker_id}` : 'N/A'}</strong></td>
                    <td>
                      <span className="farm-badge farm-badge-info">
                        {t.factory_id ? `Factory #${t.factory_id}` : 'N/A'}
                      </span>
                    </td>
                    <td>{t.quantity?.toFixed(1) || 0}</td>
                    <td>KES {t.cost_per_unit?.toFixed(2) || 0}</td>
                    <td>
                      <strong>KES {t.total_amount?.toFixed(2) || 0}</strong>
                    </td>
                    <td>
                      <span className={`farm-badge ${
                        t.deduction_type === 'monthly' ? 'farm-badge-info' :
                        t.deduction_type === 'annual_bonus' ? 'farm-badge-warning' :
                        'farm-badge-success'
                      }`}>
                        {t.deduction_type?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`farm-badge ${
                        t.status === 'pending' ? 'farm-badge-warning' :
                        t.status === 'completed' ? 'farm-badge-success' :
                        'farm-badge-danger'
                      }`}>
                        {t.status || 'N/A'}
                      </span>
                    </td>
                    <td>{t.notes || '-'}</td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        {t.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(t.id, 'completed')}
                            className="farm-btn farm-btn-success"
                            style={{padding: '0.3rem 0.6rem', fontSize: '0.85rem'}}
                          >
                            ✓ Complete
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="farm-btn farm-btn-danger"
                          style={{padding: '0.3rem 0.6rem', fontSize: '0.85rem'}}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="farm-card" style={{background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'}}>
        <h3 style={{color: 'var(--farm-green)', marginBottom: '1rem'}}>ℹ️ How Fertilizer Deductions Work</h3>
        <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
          <li><strong>Monthly:</strong> Deducted from the worker's monthly payroll</li>
          <li><strong>Annual Bonus:</strong> Deducted from year-end bonus payments</li>
          <li><strong>Immediate:</strong> Deducted in the current pay period</li>
          <li><strong>Pending Status:</strong> Not yet deducted from salary</li>
          <li><strong>Completed Status:</strong> Already deducted from salary</li>
          <li><strong>Payroll Integration:</strong> Monthly deductions are automatically calculated in the payroll system</li>
        </ul>
      </div>
    </div>
  )
}
