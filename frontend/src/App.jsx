import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Staff from './components/Staff'
import TeaPlucking from './components/TeaPlucking'
import Payroll from './components/Payroll'
import Fertilizer from './components/Fertilizer'
import Poultry from './components/Poultry'
import Dairy from './components/Dairy'
import Dogs from './components/Dogs'
import Inventory from './components/Inventory'

const API_BASE = 'http://localhost:8000'

function Home() {
  return <div style={{padding:20}}><h1>C. SAMBU FARM - PWA</h1><p>Welcome to the Farm Management System</p></div>
}

function Finance() {
  const [transactions, setTransactions] = React.useState([])
  const [form, setForm] = React.useState({ date: '', category: '', description: '', amount: '', unit: '' })

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/finance/`)
      setTransactions(res.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
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

  return (
    <div style={{padding:20}}>
      <h1>Finance</h1>
      <h2>Transactions</h2>
      <ul>
        {transactions.map(t => (
          <li key={t.id} style={{marginBottom:10}}>
            <div>{t.category || 'Uncategorized'} - {t.description || 'No description'} - {t.amount ?? 0} {t.unit || ''} - {t.date ? new Date(t.date).toLocaleString() : 'No date'}</div>
            <button type="button" onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit} style={{display:'grid', gap:10, maxWidth:300}}>
        <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
        <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
        <input type="text" placeholder="Unit" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
        <button type="submit">Add Transaction</button>
      </form>
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
            <Link to="/" className="farm-nav-link">🏠 Home</Link>
            <Link to="/dashboard" className="farm-nav-link">📊 Dashboard</Link>
            <Link to="/staff" className="farm-nav-link">👥 Staff</Link>
            <Link to="/teaplucking" className="farm-nav-link">🍃 Tea Plucking</Link>
            <Link to="/payroll" className="farm-nav-link">💰 Payroll</Link>
            <Link to="/fertilizer" className="farm-nav-link">🌱 Fertilizer</Link>
            <Link to="/poultry" className="farm-nav-link">🐔 Poultry</Link>
            <Link to="/dairy" className="farm-nav-link">🐄 Dairy</Link>
            <Link to="/dogs" className="farm-nav-link">🐕 Dogs</Link>
            <Link to="/inventory" className="farm-nav-link">📦 Inventory</Link>
            <Link to="/finance" className="farm-nav-link">💵 Finance</Link>
          </div>
        </div>
      </nav>
      <div className="farm-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/teaplucking" element={<TeaPlucking />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/fertilizer" element={<Fertilizer />} />
          <Route path="/poultry" element={<Poultry />} />
          <Route path="/dairy" element={<Dairy />} />
          <Route path="/dogs" element={<Dogs />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/finance" element={<Finance />} />
        </Routes>
      </div>
    </div>
  )
}
