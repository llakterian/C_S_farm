import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

const API_BASE = 'http://localhost:8000'

export default function Advances() {
  const [advances, setAdvances] = useState([])
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({
    worker_id: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    date: '',
    notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchAdvances()
    fetchStaff()
  }, [])

  const fetchAdvances = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/advances/`)
      setAdvances(res.data)
    } catch (error) {
      console.error('Error fetching advances:', error)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/advances/`, {
        worker_id: parseInt(form.worker_id),
        amount: parseFloat(form.amount),
        month: parseInt(form.month),
        year: parseInt(form.year),
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        deducted: false,
        notes: form.notes || null
      })
      setForm({
        worker_id: '',
        amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        date: '',
        notes: ''
      })
      fetchAdvances()
      alert('Advance recorded successfully!')
    } catch (error) {
      console.error('Error adding advance:', error)
      alert('Error recording advance. Please check your input.')
    }
  }

  const handleDelete = async (advanceId) => {
    if (!window.confirm('Delete this advance?')) return
    
    try {
      await axios.delete(`${API_BASE}/advances/${advanceId}`)
      fetchAdvances()
    } catch (error) {
      console.error('Error deleting advance:', error)
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const filteredAdvances = advances.filter(a => 
    a.month === filterMonth && a.year === filterYear
  )

  const calculateStats = () => {
    const total = filteredAdvances.reduce((sum, a) => sum + (a.amount || 0), 0)
    const pending = filteredAdvances.filter(a => !a.deducted).reduce((sum, a) => sum + (a.amount || 0), 0)
    const deducted = filteredAdvances.filter(a => a.deducted).reduce((sum, a) => sum + (a.amount || 0), 0)

    return { total, pending, deducted, count: filteredAdvances.length }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="farm-loading">Loading advances data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>💵 Worker Advances</h1>
        <p>Track money advances given to workers (deducted from monthly payroll)</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Filter by Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Month</label>
              <select 
                className="w-full"
                value={filterMonth}
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Year</label>
              <Input
                type="number"
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Advances</div>
            <div className="text-2xl font-bold text-foreground">{stats.count}</div>
            <div className="text-xs text-muted-foreground">This period</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
            <div className="text-2xl font-bold text-foreground">KES {stats.total.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">All advances</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-amber-600">KES {stats.pending.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Not yet deducted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Deducted</div>
            <div className="text-2xl font-bold text-green-600">KES {stats.deducted.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">From payroll</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Advance Form */}
      <Card>
        <CardHeader>
          <CardTitle>➕ Record Worker Advance</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-muted-foreground">No tea plucking workers found.</p>
              <p className="text-sm text-muted-foreground">Please add staff members with pay type "per_kilo" first.</p>
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
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount (KES)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Deduct from Month</label>
                <select 
                  className="w-full"
                  value={form.month}
                  onChange={e => setForm({...form, month: e.target.value})}
                  required
                >
                  {months.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={e => setForm({...form, year: e.target.value})}
                  min="2020"
                  max="2030"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Given</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Notes (optional)</label>
                <Input
                  type="text"
                  placeholder="Add any notes about this advance..."
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" className="w-full">
                  ➕ Record Advance
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Advances Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            📋 Advances for {months[filterMonth - 1]} {filterYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAdvances.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💵</div>
              <p className="text-muted-foreground">No advances for this period.</p>
              <p className="text-sm text-muted-foreground">Record advances using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date Given</th>
                    <th className="text-left p-2">Worker</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Deduct From</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Notes</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdvances.map(a => (
                    <tr key={a.id} className="border-b">
                      <td className="p-2">{a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-2"><strong>{a.worker_name || `Worker #${a.worker_id}`}</strong></td>
                      <td className="p-2">
                        <strong className="text-amber-600">
                          KES {a.amount?.toFixed(2) || 0}
                        </strong>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">
                          {months[a.month - 1]} {a.year}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={a.deducted ? "default" : "destructive"}>
                          {a.deducted ? '✓ Deducted' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-2">{a.notes || '-'}</td>
                      <td className="p-2">
                        {!a.deducted && (
                          <Button 
                            onClick={() => handleDelete(a.id)}
                            variant="destructive"
                            size="sm"
                          >
                            🗑️ Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted font-bold">
                  <tr>
                    <td colSpan="2" className="p-2">TOTALS</td>
                    <td className="p-2">KES {stats.total.toFixed(2)}</td>
                    <td colSpan="4" className="p-2">
                      Pending: KES {stats.pending.toFixed(2)} | 
                      Deducted: KES {stats.deducted.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Box */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">ℹ️ How Worker Advances Work</h3>
          <ul className="space-y-2 pl-5">
            <li><strong>Recording:</strong> When you give a worker money during the month, record it as an advance</li>
            <li><strong>Deduction Month:</strong> Specify which month's payroll the advance should be deducted from</li>
            <li><strong>Automatic Deduction:</strong> When you calculate monthly payroll, all pending advances for that month are automatically deducted</li>
            <li><strong>Status Tracking:</strong> System tracks which advances have been deducted and which are still pending</li>
            <li><strong>Payroll Integration:</strong> Net pay = Gross earnings - Advances</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
