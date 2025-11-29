import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

const API_BASE = 'http://localhost:8000'

export default function TeaPlucking() {
  const [records, setRecords] = useState([])
  const [staff, setStaff] = useState([])
  const [factories, setFactories] = useState([])
  const [form, setForm] = useState({ worker_id: '', factory_id: '', quantity: 0, date: '', comment: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
    fetchStaff()
    fetchFactories()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE}/teaplucking/`)
      setRecords(res.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tea plucking records:', error)
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
      await axios.post(`${API_BASE}/teaplucking/`, {
        worker_id: parseInt(form.worker_id),
        factory_id: parseInt(form.factory_id),
        quantity: parseFloat(form.quantity),
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        comment: form.comment || null
      })
      setForm({ worker_id: '', factory_id: '', quantity: 0, date: '', comment: '' })
      fetchRecords()
    } catch (error) {
      console.error('Error adding tea plucking record:', error)
      alert('Error adding record. Please check your input.')
    }
  }

  const handleDelete = async (recordId) => {
    if (!window.confirm('Delete this tea plucking record?')) return
    
    try {
      await axios.delete(`${API_BASE}/teaplucking/${recordId}`)
      fetchRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const calculateTodayStats = () => {
    const today = new Date().toDateString()
    const todayRecords = records.filter(r => {
      const recordDate = new Date(r.date).toDateString()
      return recordDate === today
    })

    const totalKg = todayRecords.reduce((sum, r) => sum + r.quantity, 0)
    const totalGross = todayRecords.reduce((sum, r) => sum + (r.gross_amount || 0), 0)
    const totalNet = todayRecords.reduce((sum, r) => sum + (r.net_amount || 0), 0)

    return { totalKg, totalGross, totalNet, count: todayRecords.length }
  }

  const stats = calculateTodayStats()

  if (loading) {
    return <div className="farm-loading">Loading tea plucking records...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>🍃 Tea Plucking Management</h1>
        <p>Track daily tea plucking with factory rates and automatic payment calculations</p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Today's Production</div>
            <div className="text-2xl font-bold text-foreground">{stats.totalKg.toFixed(1)} kg</div>
            <div className="text-xs text-muted-foreground">{stats.count} records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Gross Earnings</div>
            <div className="text-2xl font-bold text-foreground">KES {stats.totalGross.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Before transport deduction</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Net Earnings</div>
            <div className="text-2xl font-bold text-green-600">KES {stats.totalNet.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">After transport deduction</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Records</div>
            <div className="text-2xl font-bold text-foreground">{records.length}</div>
            <div className="text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Record Form */}
      <Card>
        <CardHeader>
          <CardTitle>➕ Add Tea Plucking Record</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-muted-foreground">No tea plucking workers found.</p>
              <p className="text-sm text-muted-foreground">Please add staff members with pay type "per_kilo" first.</p>
            </div>
          ) : factories.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏭</div>
              <p className="text-muted-foreground">No factories found.</p>
              <p className="text-sm text-muted-foreground">Please initialize factories first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Worker</label>
                <select 
                  className="w-full"
                  value={form.worker_id} 
                  onChange={e => setForm({...form, worker_id: e.target.value})}
                  required
                >
                  <option value="">Select Worker</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Factory</label>
                <select 
                  className="w-full"
                  value={form.factory_id} 
                  onChange={e => setForm({...form, factory_id: e.target.value})}
                  required
                >
                  <option value="">Select Factory</option>
                  {factories.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} - KES {f.rate_per_kg}/kg (Transport: KES {f.transport_deduction})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={e => setForm({...form, quantity: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Comment (optional)</label>
                <Input
                  type="text"
                  placeholder="Add any notes..."
                  value={form.comment}
                  onChange={e => setForm({...form, comment: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" className="w-full">➕ Add Record</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Tea Plucking Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🍃</div>
              <p className="text-muted-foreground">No tea plucking records yet.</p>
              <p className="text-sm text-muted-foreground">Add your first record using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Worker</th>
                    <th className="text-left p-2">Factory</th>
                    <th className="text-left p-2">Quantity (kg)</th>
                    <th className="text-left p-2">Rate/kg</th>
                    <th className="text-left p-2">Gross Amount</th>
                    <th className="text-left p-2">Transport</th>
                    <th className="text-left p-2">Net Amount</th>
                    <th className="text-left p-2">Comment</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-2"><strong>{r.worker_name || `Worker #${r.worker_id}`}</strong></td>
                      <td className="p-2">
                        <Badge variant="secondary">
                          {r.factory_name || 'Not assigned'}
                        </Badge>
                      </td>
                      <td className="p-2">{r.quantity.toFixed(1)}</td>
                      <td className="p-2">KES {r.rate_per_kg ? r.rate_per_kg.toFixed(2) : 'N/A'}</td>
                      <td className="p-2"><strong>KES {r.gross_amount ? r.gross_amount.toFixed(2) : 'N/A'}</strong></td>
                      <td className="p-2">KES {r.transport_deduction ? (r.quantity * r.transport_deduction).toFixed(2) : 'N/A'}</td>
                      <td className="p-2">
                        <strong className="text-green-600">KES {r.net_amount ? r.net_amount.toFixed(2) : 'N/A'}</strong>
                      </td>
                      <td className="p-2">{r.comment || '-'}</td>
                      <td className="p-2">
                        <Button 
                          onClick={() => handleDelete(r.id)} 
                          variant="destructive" 
                          size="sm"
                        >
                          🗑️ Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
