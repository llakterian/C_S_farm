import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Bonus() {
  const [bonuses, setBonuses] = useState([])
  const [factories, setFactories] = useState([])
  const [form, setForm] = useState({
    factory_id: '',
    period: '',
    amount: 0,
    fertilizer_deductions: 0,
    date_received: '',
    notes: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBonuses()
    fetchFactories()
  }, [])

  const fetchBonuses = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/bonus/`)
      setBonuses(res.data)
    } catch (error) {
      console.error('Error fetching bonuses:', error)
    } finally {
      setLoading(false)
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
      const netBonus = parseFloat(form.amount) - parseFloat(form.fertilizer_deductions)
      
      await axios.post(`${API_BASE}/bonus/`, {
        factory_id: parseInt(form.factory_id),
        period: form.period,
        amount: parseFloat(form.amount),
        fertilizer_deductions: parseFloat(form.fertilizer_deductions),
        net_bonus: netBonus,
        date_received: form.date_received ? new Date(form.date_received).toISOString() : new Date().toISOString(),
        notes: form.notes || null
      })
      setForm({
        factory_id: '',
        period: '',
        amount: 0,
        fertilizer_deductions: 0,
        date_received: '',
        notes: ''
      })
      fetchBonuses()
      alert('Bonus payment recorded successfully!')
    } catch (error) {
      console.error('Error adding bonus:', error)
      alert('Error recording bonus. Please check your input.')
    }
  }

  const handleDelete = async (bonusId) => {
    if (!window.confirm('Delete this bonus payment?')) return
    
    try {
      await axios.delete(`${API_BASE}/bonus/${bonusId}`)
      fetchBonuses()
    } catch (error) {
      console.error('Error deleting bonus:', error)
    }
  }

  const calculateStats = () => {
    const totalAmount = bonuses.reduce((sum, b) => sum + (b.amount || 0), 0)
    const totalFertilizerDeductions = bonuses.reduce((sum, b) => sum + (b.fertilizer_deductions || 0), 0)
    const totalNetBonus = bonuses.reduce((sum, b) => sum + (b.net_bonus || 0), 0)

    return { 
      count: bonuses.length,
      totalAmount,
      totalFertilizerDeductions,
      totalNetBonus
    }
  }

  const stats = calculateStats()

  // Generate period options (e.g., 2024-H1, 2024-H2)
  const generatePeriodOptions = () => {
    const currentYear = new Date().getFullYear()
    const options = []
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      options.push({ value: `${year}-H1`, label: `${year} - First Half (H1)` })
      options.push({ value: `${year}-H2`, label: `${year} - Second Half (H2)` })
    }
    return options
  }

  const periodOptions = generatePeriodOptions()

  if (loading) {
    return <div className="farm-loading">Loading bonus data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>🎁 Bonus Payments</h1>
        <p>Track biannual bonus payments from factories (with fertilizer deductions)</p>
      </div>

      {/* Summary Statistics */}
      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Bonuses</div>
          <div className="farm-summary-value">{stats.count}</div>
          <div className="farm-summary-label">All time</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Gross Bonuses</div>
          <div className="farm-summary-value">KES {stats.totalAmount.toFixed(2)}</div>
          <div className="farm-summary-label">Before deductions</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Fertilizer Deductions</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-brown)'}}>
            KES {stats.totalFertilizerDeductions.toFixed(2)}
          </div>
          <div className="farm-summary-label">Total deducted</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Net Bonuses</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>
            KES {stats.totalNetBonus.toFixed(2)}
          </div>
          <div className="farm-summary-label">Actually received</div>
        </div>
      </div>

      {/* Add Bonus Payment Form */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Record Bonus Payment</h2>
        </div>

        {factories.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🏭</div>
            <p>No factories found.</p>
            <p>Please initialize factories first.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="farm-form">
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
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Period</label>
              <select 
                className="farm-select"
                value={form.period}
                onChange={e => setForm({...form, period: e.target.value})}
                required
              >
                <option value="">Select Period</option>
                {periodOptions.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Bonus Amount (KES)</label>
              <input
                className="farm-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Total bonus amount"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                required
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Fertilizer Deductions (KES)</label>
              <input
                className="farm-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Fertilizer costs"
                value={form.fertilizer_deductions}
                onChange={e => setForm({...form, fertilizer_deductions: e.target.value})}
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Net Bonus (Auto-calculated)</label>
              <input
                className="farm-input"
                type="text"
                value={`KES ${((parseFloat(form.amount) || 0) - (parseFloat(form.fertilizer_deductions) || 0)).toLocaleString()}`}
                disabled
                style={{backgroundColor: '#e8f5e9', color: '#2d5016', fontWeight: 'bold'}}
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Date Received</label>
              <input
                className="farm-input"
                type="date"
                value={form.date_received}
                onChange={e => setForm({...form, date_received: e.target.value})}
              />
            </div>

            <div className="farm-form-group" style={{gridColumn: '1 / -1'}}>
              <label className="farm-form-label">Notes (optional)</label>
              <input
                className="farm-input"
                type="text"
                placeholder="Add any notes about this bonus..."
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
              />
            </div>

            <div style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="farm-btn farm-btn-primary">
                ➕ Record Bonus
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bonus Payments Table */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Bonus Payment History</h2>
        </div>

        {bonuses.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🎁</div>
            <p>No bonus payments yet.</p>
            <p>Record bonuses using the form above.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Date Received</th>
                  <th>Factory</th>
                  <th>Period</th>
                  <th>Gross Bonus</th>
                  <th>Fertilizer Deductions</th>
                  <th>Net Bonus</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bonuses.map(b => (
                  <tr key={b.id}>
                    <td>{b.date_received ? new Date(b.date_received).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className="farm-badge farm-badge-info">
                        {b.factory_name || `Factory #${b.factory_id}`}
                      </span>
                    </td>
                    <td>
                      <span className="farm-badge farm-badge-success">
                        {b.period}
                      </span>
                    </td>
                    <td>
                      <strong>KES {b.amount?.toLocaleString() || 0}</strong>
                    </td>
                    <td style={{color: 'var(--farm-brown)'}}>
                      KES {b.fertilizer_deductions?.toLocaleString() || 0}
                    </td>
                    <td>
                      <strong style={{color: 'var(--farm-green)', fontSize: '1.1rem'}}>
                        KES {b.net_bonus?.toLocaleString() || 0}
                      </strong>
                    </td>
                    <td>{b.notes || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(b.id)}
                        className="farm-btn farm-btn-danger"
                        style={{padding: '0.3rem 0.6rem', fontSize: '0.85rem'}}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{backgroundColor: 'var(--farm-cream)', fontWeight: 'bold'}}>
                <tr>
                  <td colSpan="3">TOTALS</td>
                  <td>KES {stats.totalAmount.toFixed(2)}</td>
                  <td>KES {stats.totalFertilizerDeductions.toFixed(2)}</td>
                  <td style={{color: 'var(--farm-green)'}}>
                    KES {stats.totalNetBonus.toFixed(2)}
                  </td>
                  <td colSpan="2">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="farm-card" style={{background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'}}>
        <h3 style={{color: 'var(--farm-green)', marginBottom: '1rem'}}>ℹ️ How Bonus System Works</h3>
        <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
          <li><strong>Biannual Payments:</strong> Factories pay bonuses twice per year (H1 and H2)</li>
          <li><strong>Payment Schedule:</strong></li>
          <ul style={{paddingLeft: '1.5rem', marginTop: '0.5rem'}}>
            <li><strong>H1 (First Half):</strong> Bonus for January-June production</li>
            <li><strong>H2 (Second Half):</strong> Bonus for July-December production</li>
          </ul>
          <li><strong>Fertilizer Deductions:</strong> Cost of fertilizer purchased from factory is deducted from bonus</li>
          <li><strong>Net Bonus:</strong> Gross Bonus - Fertilizer Deductions = Amount Actually Received</li>
          <li><strong>Tracking:</strong> System helps reconcile fertilizer payments with bonus payments</li>
        </ul>
      </div>
    </div>
  )
}
