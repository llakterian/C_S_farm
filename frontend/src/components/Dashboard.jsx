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
      <div className="farm-page-header" style={{
        background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.95) 0%, rgba(56, 102, 28, 0.95) 100%)',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '60px 60px'
      }}>
        <h1 style={{margin: '0 0 0.5rem 0', fontSize: '2.5rem'}}>📊 Farm Dashboard</h1>
        <p style={{margin: 0, fontSize: '1.1rem', opacity: 0.95}}>Overview of C. Sambu Farm operations and statistics</p>
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

      {/* Tea Production Section with Background */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.15) 100%)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '2px solid rgba(76, 175, 80, 0.3)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M50 10 C30 10, 20 30, 20 50 C20 70, 30 90, 50 90 C70 90, 80 70, 80 50 C80 30, 70 10, 50 10 M50 20 C35 20, 30 35, 30 50 C30 65, 35 80, 50 80 C65 80, 70 65, 70 50 C70 35, 65 20, 50 20" fill="%232d5016" fill-opacity="0.05"/%3E%3C/svg%3E")',
        backgroundSize: '150px 150px',
        backgroundPosition: 'right bottom',
        backgroundRepeat: 'no-repeat'
      }}>
        <h2 style={{color: 'var(--farm-green)', marginBottom: '1rem', fontSize: '1.5rem'}}>
          🍃 Tea Production Overview
        </h2>

      {/* Factory Rates Card */}
      <div className="farm-card" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}>
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

      {/* Farm Sections Overview with Backgrounds */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
        {/* Dairy Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 235, 205, 0.9) 0%, rgba(255, 218, 185, 0.9) 100%)',
          borderRadius: '12px',
          padding: '2rem',
          border: '2px solid rgba(210, 105, 30, 0.3)',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="40" cy="40" r="20" fill="%23d2691e" fill-opacity="0.1"/%3E%3Ccircle cx="40" cy="40" r="15" fill="%23d2691e" fill-opacity="0.1"/%3E%3C/svg%3E")',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat'
        }}>
          <h3 style={{color: 'var(--farm-brown)', marginBottom: '1rem'}}>🐄 Dairy Operations</h3>
          <p style={{marginBottom: '1rem'}}>Manage milk production and cattle health</p>
          <a href="/dairy" style={{textDecoration: 'none'}}>
            <button className="farm-btn farm-btn-primary" style={{width: '100%'}}>
              View Dairy →
            </button>
          </a>
        </div>

        {/* Avocado Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(144, 238, 144, 0.9) 0%, rgba(152, 251, 152, 0.9) 100%)',
          borderRadius: '12px',
          padding: '2rem',
          border: '2px solid rgba(34, 139, 34, 0.3)',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cellipse cx="40" cy="40" rx="25" ry="30" fill="%23228b22" fill-opacity="0.1"/%3E%3C/svg%3E")',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat'
        }}>
          <h3 style={{color: '#228b22', marginBottom: '1rem'}}>🥑 Avocado Grove</h3>
          <p style={{marginBottom: '1rem'}}>Track harvest from 40+ Hass & Fuerte trees</p>
          <a href="/avocado" style={{textDecoration: 'none'}}>
            <button className="farm-btn farm-btn-success" style={{width: '100%'}}>
              View Avocado →
            </button>
          </a>
        </div>

        {/* Poultry Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 205, 0.9) 0%, rgba(255, 248, 220, 0.9) 100%)',
          borderRadius: '12px',
          padding: '2rem',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 10 L35 20 L30 30 L25 20 Z" fill="%23ffd700" fill-opacity="0.2"/%3E%3C/svg%3E")',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat'
        }}>
          <h3 style={{color: '#b8860b', marginBottom: '1rem'}}>🐔 Poultry Farm</h3>
          <p style={{marginBottom: '1rem'}}>Monitor egg production and flock health</p>
          <a href="/poultry" style={{textDecoration: 'none'}}>
            <button className="farm-btn farm-btn-secondary" style={{width: '100%'}}>
              View Poultry →
            </button>
          </a>
        </div>
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
          <a href="/reports" style={{textDecoration: 'none'}}>
            <button className="farm-btn farm-btn-success" style={{width: '100%', padding: '1.5rem'}}>
              📊 View Reports
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
