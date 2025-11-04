import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ name: '', role: '', pay_type: 'monthly', pay_rate: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/staff/`)
      setStaff(res.data)
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/staff/`, {
        ...form,
        pay_rate: parseFloat(form.pay_rate)
      })
      setForm({ name: '', role: '', pay_type: 'monthly', pay_rate: 0 })
      fetchStaff()
      alert('Staff member added successfully!')
    } catch (error) {
      console.error('Error adding staff:', error)
      alert('Error adding staff member')
    }
  }

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return
    
    try {
      await axios.delete(`${API_BASE}/staff/${staffId}`)
      fetchStaff()
    } catch (error) {
      console.error('Error deleting staff:', error)
    }
  }

  const calculateStats = () => {
    const monthlyStaff = staff.filter(s => s.pay_type === 'monthly')
    const teaPluckers = staff.filter(s => s.pay_type === 'per_kilo')
    const totalMonthlyPayroll = monthlyStaff.reduce((sum, s) => sum + (s.pay_rate || 0), 0)

    return {
      total: staff.length,
      monthly: monthlyStaff.length,
      teaPluckers: teaPluckers.length,
      monthlyPayroll: totalMonthlyPayroll
    }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="farm-loading">Loading staff data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>👥 Staff Management</h1>
        <p>Manage farm workers and their salary information</p>
      </div>

      {/* Summary Statistics */}
      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Staff</div>
          <div className="farm-summary-value">{stats.total}</div>
          <div className="farm-summary-label">All employees</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Monthly Workers</div>
          <div className="farm-summary-value">{stats.monthly}</div>
          <div className="farm-summary-label">Fixed salary</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Tea Pluckers</div>
          <div className="farm-summary-value">{stats.teaPluckers}</div>
          <div className="farm-summary-label">Per kilo payment</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Monthly Payroll</div>
          <div className="farm-summary-value">KES {stats.monthlyPayroll.toFixed(0)}</div>
          <div className="farm-summary-label">Fixed salaries only</div>
        </div>
      </div>

      {/* Add Staff Form */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Add New Staff Member</h2>
        </div>

        <form onSubmit={handleSubmit} className="farm-form">
          <div className="farm-form-group">
            <label className="farm-form-label">Full Name</label>
            <input
              className="farm-input"
              type="text"
              placeholder="Enter full name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Role/Position</label>
            <input
              className="farm-input"
              type="text"
              placeholder="e.g., Tea Plucker, Farm Manager"
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
              required
            />
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Payment Type</label>
            <select
              className="farm-select"
              value={form.pay_type}
              onChange={e => setForm({...form, pay_type: e.target.value})}
            >
              <option value="monthly">Monthly Salary</option>
              <option value="per_kilo">Per Kilo (Tea Pluckers)</option>
            </select>
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">
              {form.pay_type === 'monthly' ? 'Monthly Salary (KES)' : 'Rate per Kg (KES)'}
            </label>
            <input
              className="farm-input"
              type="number"
              step="0.01"
              placeholder={form.pay_type === 'monthly' ? 'e.g., 15000' : 'Leave at 0 (factory rates apply)'}
              value={form.pay_rate}
              onChange={e => setForm({...form, pay_rate: e.target.value})}
              required
            />
          </div>

          <div style={{gridColumn: '1 / -1'}}>
            <button type="submit" className="farm-btn farm-btn-primary">
              ➕ Add Staff Member
            </button>
          </div>
        </form>
      </div>

      {/* Staff List */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Staff Members</h2>
        </div>

        {staff.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">👥</div>
            <p>No staff members registered yet.</p>
            <p>Add your first staff member using the form above.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Payment Type</th>
                  <th>Pay Rate/Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td><strong>#{s.id}</strong></td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.role}</td>
                    <td>
                      <span className={`farm-badge ${
                        s.pay_type === 'monthly' ? 'farm-badge-info' : 'farm-badge-success'
                      }`}>
                        {s.pay_type === 'monthly' ? 'Monthly' : 'Per Kilo'}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {s.pay_type === 'monthly' 
                          ? `KES ${s.pay_rate?.toFixed(2) || 0}/month` 
                          : s.pay_rate > 0 
                            ? `KES ${s.pay_rate}/kg` 
                            : 'Factory rates apply'}
                      </strong>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="farm-btn farm-btn-danger"
                        style={{padding: '0.4rem 0.8rem'}}
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="farm-card" style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'}}>
        <h3 style={{color: 'var(--farm-green)', marginBottom: '1rem'}}>ℹ️ Staff Payment Types</h3>
        <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
          <li><strong>Monthly Salary:</strong> Fixed monthly payment for permanent staff (e.g., managers, drivers)</li>
          <li><strong>Per Kilo:</strong> For tea pluckers - payment based on quantity picked × factory rate</li>
          <li><strong>Factory Rates:</strong> Tea pluckers use dynamic factory rates (Unilever: KES 28/kg, Finlays: KES 27/kg, etc.)</li>
          <li><strong>Payroll:</strong> Monthly salaries calculated automatically in the Payroll section</li>
        </ul>
      </div>
    </div>
  )
}
