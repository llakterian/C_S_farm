import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Staff from './components/Staff'
import TeaPlucking from './components/TeaPlucking'
import Payroll from './components/Payroll'
import Fertilizer from './components/Fertilizer'
import Avocado from './components/Avocado'
import Reports from './components/Reports'
import Advances from './components/Advances'
import Bonus from './components/Bonus'
import Poultry from './components/Poultry'
import Dairy from './components/Dairy'
import Dogs from './components/Dogs'
import Inventory from './components/Inventory'
import ImportData from './components/ImportData'

const API_BASE = 'http://localhost:8000'


function Finance() {
  const [transactions, setTransactions] = React.useState([])
  const [form, setForm] = React.useState({ date: '', category: '', description: '', amount: '', unit: '' })
  const [loading, setLoading] = React.useState(true)

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/finance/`)
      setTransactions(res.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTransactions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/finance/`, {
        date: form.date ? new Date(form.date).toISOString() : null,
        category: form.category || null,
        description: form.description || null,
        amount: form.amount ? parseFloat(form.amount) : 0,
        unit: form.unit || null
      })
      setForm({ date: '', category: '', description: '', amount: '', unit: '' })
      fetchTransactions()
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const handleDelete = async (transactionId) => {
    try {
      await axios.delete(`${API_BASE}/finance/${transactionId}`)
      fetchTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const calculateStats = () => {
    const totalIncome = transactions.filter(t => (t.amount || 0) > 0).reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalExpense = transactions.filter(t => (t.amount || 0) < 0).reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, count: transactions.length }
  }

  const stats = calculateStats()

  if (loading) return <div className="farm-loading">Loading finance data...</div>

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>💵 Finance Management</h1>
        <p>Track farm income and expenses</p>
      </div>

      <div className="farm-summary-grid">
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Income</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>KES {stats.totalIncome.toFixed(2)}</div>
          <div className="farm-summary-label">Revenue</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Total Expenses</div>
          <div className="farm-summary-value" style={{color: 'var(--farm-brown)'}}>KES {stats.totalExpense.toFixed(2)}</div>
          <div className="farm-summary-label">Costs</div>
        </div>
        <div className="farm-summary-box">
          <div className="farm-summary-title">Balance</div>
          <div className="farm-summary-value" style={{color: stats.balance >= 0 ? 'var(--farm-green)' : 'red'}}>
            KES {stats.balance.toFixed(2)}
          </div>
          <div className="farm-summary-label">Net amount</div>
        </div>
      </div>

      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">➕ Add Transaction</h2>
        </div>
        <form onSubmit={handleSubmit} className="farm-form">
          <div className="farm-form-group">
            <label className="farm-form-label">Date & Time</label>
            <input className="farm-input" type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div className="farm-form-group">
            <label className="farm-form-label">Category</label>
            <select className="farm-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="">Select Category</option>
              <option value="sales">Sales (Income)</option>
              <option value="expenses">Farm Expenses</option>
              <option value="salary">Staff Salary</option>
              <option value="supplies">Supplies Purchase</option>
            </select>
          </div>
          <div className="farm-form-group">
            <label className="farm-form-label">Description</label>
            <input className="farm-input" type="text" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="farm-form-group">
            <label className="farm-form-label">Amount (KES)</label>
            <input className="farm-input" type="number" step="0.01" placeholder="Use negative for expenses" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <button type="submit" className="farm-btn farm-btn-primary">➕ Add Transaction</button>
          </div>
        </form>
      </div>

      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📋 Transactions</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">💵</div>
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.date ? new Date(t.date).toLocaleString() : 'N/A'}</td>
                    <td><span className="farm-badge farm-badge-info">{t.category || 'N/A'}</span></td>
                    <td>{t.description || 'N/A'}</td>
                    <td>
                      <strong style={{color: (t.amount || 0) >= 0 ? 'var(--farm-green)' : 'var(--farm-brown)'}}>
                        KES {(t.amount ?? 0).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(t.id)} className="farm-btn farm-btn-danger" style={{padding: '0.4rem 0.8rem'}}>🗑️</button>
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

export default function App(){
  return (
    <div>
      <nav className="farm-nav">
        <div className="farm-nav-content">
          <div className="farm-logo">
            <span className="farm-logo-icon">🌿</span>
            <h1>C. SAMBU FARM</h1>
          </div>
          <div className="farm-nav-links">
            <Link to="/" className="farm-nav-link">📊 Dashboard</Link>
            <Link to="/staff" className="farm-nav-link">👥 Staff</Link>
            <Link to="/teaplucking" className="farm-nav-link">🍃 Tea Plucking</Link>
            <Link to="/payroll" className="farm-nav-link">💰 Payroll</Link>
            <Link to="/fertilizer" className="farm-nav-link">🌱 Fertilizer</Link>
            <Link to="/advances" className="farm-nav-link">💵 Advances</Link>
            <Link to="/bonus" className="farm-nav-link">🎁 Bonus</Link>
            <Link to="/avocado" className="farm-nav-link">🥑 Avocado</Link>
            <Link to="/reports" className="farm-nav-link">📊 Reports</Link>
            <Link to="/poultry" className="farm-nav-link">🐔 Poultry</Link>
            <Link to="/dairy" className="farm-nav-link">🐄 Dairy</Link>
            <Link to="/dogs" className="farm-nav-link">🐕 Dogs</Link>
            <Link to="/inventory" className="farm-nav-link">📦 Inventory</Link>
            <Link to="/finance" className="farm-nav-link">💵 Finance</Link>
            <Link to="/import" className="farm-nav-link">📥 Import Data</Link>
          </div>
        </div>
      </nav>
      <div className="farm-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/teaplucking" element={<TeaPlucking />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/fertilizer" element={<Fertilizer />} />
          <Route path="/advances" element={<Advances />} />
          <Route path="/bonus" element={<Bonus />} />
          <Route path="/avocado" element={<Avocado />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/poultry" element={<Poultry />} />
          <Route path="/dairy" element={<Dairy />} />
          <Route path="/dogs" element={<Dogs />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/import" element={<ImportData />} />
        </Routes>
      </div>
    </div>
  )
}
