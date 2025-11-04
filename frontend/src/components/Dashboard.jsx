import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    teaWorkers: 0,
    totalProduction: 0,
    todayProduction: 0,
    monthlyGross: 0,
    monthlyNet: 0
  })
  const [recentRecords, setRecentRecords] = useState([])
  const [factories, setFactories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [staffRes, teaRes, factoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/staff/`),
        axios.get(`${API_BASE}/teaplucking/`),
        axios.get(`${API_BASE}/factories/`)
      ])

      const allStaff = staffRes.data
      const teaRecords = teaRes.data
      const factoryData = factoriesRes.data

      // Calculate statistics
      const teaWorkers = allStaff.filter(s => s.pay_type === 'per_kilo')
      const today = new Date().toDateString()
      const todayRecords = teaRecords.filter(r => new Date(r.date).toDateString() === today)
      
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthRecords = teaRecords.filter(r => {
        const recordDate = new Date(r.date)
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
      })

      setStats({
        totalWorkers: allStaff.length,
        teaWorkers: teaWorkers.length,
        totalProduction: teaRecords.reduce((sum, r) => sum + r.quantity, 0),
        todayProduction: todayRecords.reduce((sum, r) => sum + r.quantity, 0),
        monthlyGross: monthRecords.reduce((sum, r) => sum + (r.gross_amount || 0), 0),
        monthlyNet: monthRecords.reduce((sum, r) => sum + (r.net_amount || 0), 0)
      })

      setRecentRecords(teaRecords.slice(-10).reverse())
      setFactories(factoryData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="farm-loading">Loading dashboard...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>📊 Farm Dashboard</h1>
        <p>Overview of C. Sambu Farm operations and statistics</p>
      </div>

      {/* Key Metrics */}
      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">👥 Total Staff</div>
          <div className="farm-summary-value">{stats.totalWorkers}</div>
          <div className="farm-summary-label">{stats.teaWorkers} tea pluckers</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">🍃 Today's Production</div>
          <div className="farm-summary-value">{stats.todayProduction.toFixed(1)} kg</div>
          <div className="farm-summary-label">Fresh tea leaves</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">📈 Total Production</div>
          <div className="farm-summary-value">{stats.totalProduction.toFixed(1)} kg</div>
          <div className="farm-summary-label">All time</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">💰 Monthly Gross</div>
          <div className="farm-summary-value">KES {stats.monthlyGross.toFixed(0)}</div>
          <div className="farm-summary-label">This month</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">💵 Monthly Net</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>
            KES {stats.monthlyNet.toFixed(0)}
          </div>
          <div className="farm-summary-label">After deductions</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">🏭 Active Factories</div>
          <div className="farm-summary-value">{factories.length}</div>
          <div className="farm-summary-label">Tea processors</div>
        </div>
      </div>

      {/* Factory Rates Card */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">🏭 Factory Rates</h2>
        </div>
        
        {factories.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🏭</div>
            <p>No factories configured yet.</p>
          </div>
        ) : (
          <div className="farm-summary-grid">
            {factories.map(factory => (
              <div key={factory.id} className="farm-summary-box">
                <div className="farm-summary-title">{factory.name}</div>
                <div className="farm-summary-value">KES {factory.rate_per_kg}</div>
                <div className="farm-summary-label">per kg (Transport: KES {factory.transport_deduction})</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Tea Plucking Records */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Recent Tea Plucking Activity</h2>
        </div>

        {recentRecords.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">🍃</div>
            <p>No tea plucking records yet.</p>
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
                  <th>Gross Amount</th>
                  <th>Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.slice(0, 10).map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.worker_name || `Worker #${r.worker_id}`}</td>
                    <td>
                      <span className="farm-badge farm-badge-info">
                        {r.factory_name || 'N/A'}
                      </span>
                    </td>
                    <td>{r.quantity.toFixed(1)} kg</td>
                    <td>KES {r.gross_amount?.toFixed(2) || 'N/A'}</td>
                    <td>
                      <strong style={{color: 'var(--farm-green)'}}>
                        KES {r.net_amount?.toFixed(2) || 'N/A'}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">⚡ Quick Actions</h2>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
          <a href="/teaplucking" style={{textDecoration: 'none'}}>
            <button className="farm-btn farm-btn-primary" style={{width: '100%', padding: '1.5rem'}}>
              🍃 Record Tea Plucking
            </button>
          </a>
          <a href="/payroll" style={{textDecoration: 'none'}}>
            <button className="farm-btn farm-btn-secondary" style={{width: '100%', padding: '1.5rem'}}>
              💰 View Payroll
            </button>
          </a>
          <a href="/staff" style={{textDecoration: 'none'}}>
            <button className="farm-btn farm-btn-success" style={{width: '100%', padding: '1.5rem'}}>
              👥 Manage Staff
            </button>
          </a>
          <a href="/fertilizer" style={{textDecoration: 'none'}}>
            <button className="farm-btn farm-btn-primary" style={{width: '100%', padding: '1.5rem'}}>
              🌱 Track Fertilizer
            </button>
          </a>
        </div>
      </div>

      {/* System Information */}
      <div className="farm-card" style={{background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'}}>
        <h3 style={{color: 'var(--farm-brown)', marginBottom: '1rem'}}>ℹ️ System Status</h3>
        <div style={{display: 'grid', gap: '0.5rem'}}>
          <div>✅ <strong>Backend API:</strong> Connected to http://localhost:8000</div>
          <div>✅ <strong>Database:</strong> PostgreSQL (Docker)</div>
          <div>✅ <strong>Factories:</strong> {factories.length} active</div>
          <div>✅ <strong>Workers:</strong> {stats.teaWorkers} tea pluckers</div>
          <div>✅ <strong>Last Updated:</strong> {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
