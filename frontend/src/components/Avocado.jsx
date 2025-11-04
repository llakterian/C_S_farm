import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Avocado() {
  const [harvests, setHarvests] = useState([])
  const [sales, setSales] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [harvestForm, setHarvestForm] = useState({
    variety: 'hass',
    quantity_kg: 0,
    grade: 'A',
    date: '',
    notes: ''
  })
  
  const [saleForm, setSaleForm] = useState({
    quantity_kg: 0,
    price_per_kg: 20,
    buyer_name: '',
    date: '',
    payment_status: 'pending',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [harvestsRes, salesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/avocado/harvest/`),
        axios.get(`${API_BASE}/avocado/sales/`),
        axios.get(`${API_BASE}/avocado/stats/`)
      ])
      setHarvests(harvestsRes.data)
      setSales(salesRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching avocado data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHarvestSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/avocado/harvest/`, {
        ...harvestForm,
        quantity_kg: parseFloat(harvestForm.quantity_kg),
        date: harvestForm.date ? new Date(harvestForm.date).toISOString() : new Date().toISOString()
      })
      setHarvestForm({ variety: 'hass', quantity_kg: 0, grade: 'A', date: '', notes: '' })
      fetchData()
      alert('Harvest recorded successfully!')
    } catch (error) {
      console.error('Error recording harvest:', error)
      alert('Error recording harvest')
    }
  }

  const handleSaleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/avocado/sales/`, {
        ...saleForm,
        quantity_kg: parseFloat(saleForm.quantity_kg),
        price_per_kg: parseFloat(saleForm.price_per_kg),
        date: saleForm.date ? new Date(saleForm.date).toISOString() : new Date().toISOString()
      })
      setSaleForm({ quantity_kg: 0, price_per_kg: 20, buyer_name: '', date: '', payment_status: 'pending', notes: '' })
      fetchData()
      alert('Sale recorded successfully!')
    } catch (error) {
      console.error('Error recording sale:', error)
      alert('Error recording sale')
    }
  }

  const handleDeleteHarvest = async (id) => {
    if (!window.confirm('Delete this harvest record?')) return
    try {
      await axios.delete(`${API_BASE}/avocado/harvest/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting harvest:', error)
    }
  }

  const handleDeleteSale = async (id) => {
    if (!window.confirm('Delete this sale record?')) return
    try {
      await axios.delete(`${API_BASE}/avocado/sales/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting sale:', error)
    }
  }

  if (loading) {
    return <div className="farm-loading">Loading avocado data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>🥑 Avocado Farm Management</h1>
        <p>Track harvests and sales from 40+ grafted Hass & Fuerte avocado trees</p>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="farm-summary-grid">
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Trees</div>
            <div className="farm-summary-value">{stats.total_trees}+</div>
            <div className="farm-summary-label">Grafted trees</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Harvested</div>
            <div className="farm-summary-value">{stats.total_harvested_kg?.toFixed(1) || 0} kg</div>
            <div className="farm-summary-label">All time production</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Sold</div>
            <div className="farm-summary-value">{stats.total_sold_kg?.toFixed(1) || 0} kg</div>
            <div className="farm-summary-label">Revenue generated</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Unsold Stock</div>
            <div className="farm-summary-value">{stats.unsold_kg?.toFixed(1) || 0} kg</div>
            <div className="farm-summary-label">Available inventory</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Revenue</div>
            <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>
              KES {stats.total_revenue?.toFixed(2) || 0}
            </div>
            <div className="farm-summary-label">All sales</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Avg Price/kg</div>
            <div className="farm-summary-value">KES {stats.average_price_per_kg?.toFixed(2) || 0}</div>
            <div className="farm-summary-label">Current: KES 20, Future: KES 35-40</div>
          </div>
        </div>
      )}

      {/* Variety Distribution */}
      {stats && (
        <div className="farm-card" style={{background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)'}}>
          <h3 style={{color: 'var(--farm-green)', marginBottom: '1rem'}}>🌳 Variety Distribution</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
            <div>
              <strong>Hass Avocados:</strong> {stats.hass_harvested_kg?.toFixed(1) || 0} kg harvested
            </div>
            <div>
              <strong>Fuerte Avocados:</strong> {stats.fuerte_harvested_kg?.toFixed(1) || 0} kg harvested
            </div>
          </div>
        </div>
      )}

      {/* Record Harvest Form */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">🌿 Record Harvest</h2>
        </div>
        <form onSubmit={handleHarvestSubmit} className="farm-form">
          <div className="farm-form-group">
            <label className="farm-form-label">Variety</label>
            <select 
              className="farm-select"
              value={harvestForm.variety}
              onChange={e => setHarvestForm({...harvestForm, variety: e.target.value})}
            >
              <option value="hass">Hass</option>
              <option value="fuerte">Fuerte</option>
            </select>
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Quantity (kg)</label>
            <input
              className="farm-input"
              type="number"
              step="0.1"
              value={harvestForm.quantity_kg}
              onChange={e => setHarvestForm({...harvestForm, quantity_kg: e.target.value})}
              required
            />
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Grade</label>
            <select 
              className="farm-select"
              value={harvestForm.grade}
              onChange={e => setHarvestForm({...harvestForm, grade: e.target.value})}
            >
              <option value="A">Grade A (Premium)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="C">Grade C (Basic)</option>
            </select>
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Date</label>
            <input
              className="farm-input"
              type="date"
              value={harvestForm.date}
              onChange={e => setHarvestForm({...harvestForm, date: e.target.value})}
            />
          </div>

          <div className="farm-form-group" style={{gridColumn: '1 / -1'}}>
            <label className="farm-form-label">Notes</label>
            <input
              className="farm-input"
              type="text"
              value={harvestForm.notes}
              onChange={e => setHarvestForm({...harvestForm, notes: e.target.value})}
              placeholder="Optional notes..."
            />
          </div>

          <div style={{gridColumn: '1 / -1'}}>
            <button type="submit" className="farm-btn farm-btn-primary">
              🌿 Record Harvest
            </button>
          </div>
        </form>
      </div>

      {/* Record Sale Form */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">💰 Record Sale</h2>
        </div>
        <form onSubmit={handleSaleSubmit} className="farm-form">
          <div className="farm-form-group">
            <label className="farm-form-label">Quantity (kg)</label>
            <input
              className="farm-input"
              type="number"
              step="0.1"
              value={saleForm.quantity_kg}
              onChange={e => setSaleForm({...saleForm, quantity_kg: e.target.value})}
              required
            />
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Price per kg (KES)</label>
            <input
              className="farm-input"
              type="number"
              step="0.01"
              value={saleForm.price_per_kg}
              onChange={e => setSaleForm({...saleForm, price_per_kg: e.target.value})}
              required
            />
            <small style={{color: 'var(--farm-brown)'}}>Current: KES 20 | Future: KES 35-40</small>
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Buyer Name</label>
            <input
              className="farm-input"
              type="text"
              value={saleForm.buyer_name}
              onChange={e => setSaleForm({...saleForm, buyer_name: e.target.value})}
              placeholder="Buyer name (optional)"
            />
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Date</label>
            <input
              className="farm-input"
              type="date"
              value={saleForm.date}
              onChange={e => setSaleForm({...saleForm, date: e.target.value})}
            />
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Payment Status</label>
            <select 
              className="farm-select"
              value={saleForm.payment_status}
              onChange={e => setSaleForm({...saleForm, payment_status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Total Amount</label>
            <input
              className="farm-input"
              type="text"
              value={`KES ${(saleForm.quantity_kg * saleForm.price_per_kg).toFixed(2)}`}
              disabled
              style={{background: 'var(--farm-cream)', fontWeight: 'bold'}}
            />
          </div>

          <div className="farm-form-group" style={{gridColumn: '1 / -1'}}>
            <label className="farm-form-label">Notes</label>
            <input
              className="farm-input"
              type="text"
              value={saleForm.notes}
              onChange={e => setSaleForm({...saleForm, notes: e.target.value})}
              placeholder="Optional notes..."
            />
          </div>

          <div style={{gridColumn: '1 / -1'}}>
            <button type="submit" className="farm-btn farm-btn-success">
              💰 Record Sale
            </button>
          </div>
        </form>
      </div>

      {/* Harvest Records */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Harvest Records</h2>
        </div>
        {harvests.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🥑</div>
            <p>No harvest records yet.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Variety</th>
                  <th>Quantity (kg)</th>
                  <th>Grade</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {harvests.map(h => (
                  <tr key={h.id}>
                    <td>{new Date(h.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`farm-badge ${h.variety === 'hass' ? 'farm-badge-success' : 'farm-badge-info'}`}>
                        {h.variety.toUpperCase()}
                      </span>
                    </td>
                    <td><strong>{h.quantity_kg} kg</strong></td>
                    <td><span className="farm-badge farm-badge-warning">Grade {h.grade}</span></td>
                    <td>{h.notes || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteHarvest(h.id)}
                        className="farm-btn farm-btn-danger"
                        style={{padding: '0.4rem 0.8rem'}}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sales Records */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">💵 Sales Records</h2>
        </div>
        {sales.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">💰</div>
            <p>No sales records yet.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Buyer</th>
                  <th>Quantity (kg)</th>
                  <th>Price/kg</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.date).toLocaleDateString()}</td>
                    <td>{s.buyer_name || 'N/A'}</td>
                    <td><strong>{s.quantity_kg} kg</strong></td>
                    <td>KES {s.price_per_kg}</td>
                    <td>
                      <strong style={{color: 'var(--farm-green)'}}>
                        KES {s.total_amount?.toFixed(2) || (s.quantity_kg * s.price_per_kg).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <span className={`farm-badge ${
                        s.payment_status === 'paid' ? 'farm-badge-success' :
                        s.payment_status === 'partial' ? 'farm-badge-warning' :
                        'farm-badge-danger'
                      }`}>
                        {s.payment_status}
                      </span>
                    </td>
                    <td>{s.notes || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteSale(s.id)}
                        className="farm-btn farm-btn-danger"
                        style={{padding: '0.4rem 0.8rem'}}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pricing Information */}
      <div className="farm-card" style={{background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'}}>
        <h3 style={{color: 'var(--farm-brown)', marginBottom: '1rem'}}>💡 Pricing Information</h3>
        <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
          <li><strong>Current Market Price:</strong> KES 20 per kg</li>
          <li><strong>Future Buyers Offer:</strong> KES 35-40 per kg</li>
          <li><strong>Recommendation:</strong> Consider holding stock for future higher prices if buyers are committed</li>
          <li><strong>Quality Grades:</strong> Grade A (premium) commands higher prices, Grade C for processing</li>
          <li><strong>Total Trees:</strong> 40+ grafted Hass and Fuerte avocado trees</li>
        </ul>
      </div>
    </div>
  )
}
