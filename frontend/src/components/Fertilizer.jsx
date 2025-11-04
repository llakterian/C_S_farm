import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Fertilizer() {
  const [purchases, setPurchases] = useState([])
  const [factories, setFactories] = useState([])
  const [summary, setSummary] = useState(null)
  const [form, setForm] = useState({
    factory_id: '',
    bags: 0,
    payment_method: 'tea_delivery',
    date: '',
    notes: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPurchases()
    fetchFactories()
    fetchSummary()
  }, [])

  const fetchPurchases = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/fertilizer/`)
      setPurchases(res.data)
    } catch (error) {
      console.error('Error fetching fertilizer purchases:', error)
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

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fertilizer/summary`)
      setSummary(res.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/fertilizer/`, {
        factory_id: parseInt(form.factory_id),
        bags: parseInt(form.bags),
        cost_per_bag: 2500.0,
        total_cost: parseInt(form.bags) * 2500.0,
        payment_method: form.payment_method,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        paid: false,
        notes: form.notes || null
      })
      setForm({
        factory_id: '',
        bags: 0,
        payment_method: 'tea_delivery',
        date: '',
        notes: ''
      })
      fetchPurchases()
      fetchSummary()
      alert('Fertilizer purchase recorded successfully!')
    } catch (error) {
      console.error('Error adding fertilizer purchase:', error)
      alert('Error recording purchase. Please check your input.')
    }
  }

  const handleDelete = async (purchaseId) => {
    if (!window.confirm('Delete this fertilizer purchase?')) return
    
    try {
      await axios.delete(`${API_BASE}/fertilizer/${purchaseId}`)
      fetchPurchases()
      fetchSummary()
    } catch (error) {
      console.error('Error deleting purchase:', error)
    }
  }

  const markAsPaid = async (purchaseId) => {
    try {
      await axios.put(`${API_BASE}/fertilizer/${purchaseId}/mark-paid`)
      fetchPurchases()
      fetchSummary()
      alert('Purchase marked as paid!')
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  if (loading) {
    return <div className="farm-loading">Loading fertilizer data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>🌱 Fertilizer Purchases</h1>
        <p>Track fertilizer purchases from factories (KES 2,500 per bag)</p>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="farm-summary-grid">
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Purchases</div>
            <div className="farm-summary-value">{summary.total_purchases}</div>
            <div className="farm-summary-label">All time</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Bags</div>
            <div className="farm-summary-value">{summary.total_bags}</div>
            <div className="farm-summary-label">Purchased</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Cost</div>
            <div className="farm-summary-value">KES {summary.total_cost?.toFixed(2) || 0}</div>
            <div className="farm-summary-label">All purchases</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Unpaid Amount</div>
            <div className="farm-summary-value" style={{color: 'var(--farm-brown)'}}>
              KES {summary.unpaid_amount?.toFixed(2) || 0}
            </div>
            <div className="farm-summary-label">Outstanding</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Paid Amount</div>
            <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>
              KES {summary.paid_amount?.toFixed(2) || 0}
            </div>
            <div className="farm-summary-label">Settled</div>
          </div>
        </div>
      )}

      {/* Add Fertilizer Purchase Form */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Record Fertilizer Purchase</h2>
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
              <label className="farm-form-label">Number of Bags</label>
              <input
                className="farm-input"
                type="number"
                min="1"
                placeholder="Enter number of bags"
                value={form.bags}
                onChange={e => setForm({...form, bags: e.target.value})}
                required
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Cost per Bag</label>
              <input
                className="farm-input"
                type="text"
                value="KES 2,500"
                disabled
                style={{backgroundColor: '#f5f1e8', color: '#666'}}
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Total Cost</label>
              <input
                className="farm-input"
                type="text"
                value={`KES ${(form.bags * 2500).toLocaleString()}`}
                disabled
                style={{backgroundColor: '#f5f1e8', color: '#666', fontWeight: 'bold'}}
              />
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Payment Method</label>
              <select 
                className="farm-select"
                value={form.payment_method}
                onChange={e => setForm({...form, payment_method: e.target.value})}
              >
                <option value="tea_delivery">Deduct from Tea Deliveries</option>
                <option value="bonus_deduction">Deduct from Bonus</option>
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-form-label">Purchase Date</label>
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
                placeholder="Add any notes about this purchase..."
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
              />
            </div>

            <div style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="farm-btn farm-btn-primary">
                ➕ Record Purchase
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Fertilizer Purchases Table */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Purchase History</h2>
        </div>

        {purchases.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🌱</div>
            <p>No fertilizer purchases yet.</p>
            <p>Record your first purchase using the form above.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Factory</th>
                  <th>Bags</th>
                  <th>Cost/Bag</th>
                  <th>Total Cost</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td>{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className="farm-badge farm-badge-info">
                        {p.factory_name || `Factory #${p.factory_id}`}
                      </span>
                    </td>
                    <td><strong>{p.bags}</strong></td>
                    <td>KES {p.cost_per_bag?.toLocaleString() || '2,500'}</td>
                    <td>
                      <strong>KES {p.total_cost?.toLocaleString() || 0}</strong>
                    </td>
                    <td>
                      <span className={`farm-badge ${
                        p.payment_method === 'tea_delivery' ? 'farm-badge-success' : 'farm-badge-warning'
                      }`}>
                        {p.payment_method === 'tea_delivery' ? 'Tea Delivery' : 'Bonus Deduction'}
                      </span>
                    </td>
                    <td>
                      <span className={`farm-badge ${
                        p.paid ? 'farm-badge-success' : 'farm-badge-warning'
                      }`}>
                        {p.paid ? '✓ Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>{p.notes || '-'}</td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        {!p.paid && (
                          <button 
                            onClick={() => markAsPaid(p.id)}
                            className="farm-btn farm-btn-success"
                            style={{padding: '0.3rem 0.6rem', fontSize: '0.85rem'}}
                          >
                            ✓ Mark Paid
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(p.id)}
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
        <h3 style={{color: 'var(--farm-green)', marginBottom: '1rem'}}>ℹ️ How Fertilizer System Works</h3>
        <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
          <li><strong>Purchase from Factories:</strong> Farm buys fertilizer from tea factories at KES 2,500 per bag</li>
          <li><strong>Payment Methods:</strong></li>
          <ul style={{paddingLeft: '1.5rem', marginTop: '0.5rem'}}>
            <li><strong>Tea Delivery:</strong> Cost deducted from monthly tea deliveries to factory</li>
            <li><strong>Bonus Deduction:</strong> Cost deducted from biannual bonus payments</li>
          </ul>
          <li><strong>Tracking:</strong> System tracks unpaid purchases and total costs owed to each factory</li>
          <li><strong>Reports:</strong> View fertilizer expenses by factory in the Reports page</li>
        </ul>
      </div>
    </div>
  )
}
