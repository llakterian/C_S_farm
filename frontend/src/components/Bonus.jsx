import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Bonuses</div>
            <div className="text-2xl font-bold text-foreground">{stats.count}</div>
            <div className="text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Gross Bonuses</div>
            <div className="text-2xl font-bold text-foreground">KES {stats.totalAmount.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Before deductions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Fertilizer Deductions</div>
            <div className="text-2xl font-bold text-amber-600">KES {stats.totalFertilizerDeductions.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Total deducted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Net Bonuses</div>
            <div className="text-2xl font-bold text-green-600">KES {stats.totalNetBonus.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Actually received</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Bonus Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>➕ Record Bonus Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {factories.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏭</div>
              <p className="text-muted-foreground">No factories found.</p>
              <p className="text-sm text-muted-foreground">Please initialize factories first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Period</label>
                <select 
                  className="w-full"
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bonus Amount (KES)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Total bonus amount"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fertilizer Deductions (KES)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Fertilizer costs"
                  value={form.fertilizer_deductions}
                  onChange={e => setForm({...form, fertilizer_deductions: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Net Bonus (Auto-calculated)</label>
                <Input
                  type="text"
                  value={`KES ${((parseFloat(form.amount) || 0) - (parseFloat(form.fertilizer_deductions) || 0)).toLocaleString()}`}
                  disabled
                  className="bg-green-50 text-green-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Received</label>
                <Input
                  type="date"
                  value={form.date_received}
                  onChange={e => setForm({...form, date_received: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Notes (optional)</label>
                <Input
                  type="text"
                  placeholder="Add any notes about this bonus..."
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" className="w-full">
                  ➕ Record Bonus
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Bonus Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Bonus Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {bonuses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎁</div>
              <p className="text-muted-foreground">No bonus payments yet.</p>
              <p className="text-sm text-muted-foreground">Record bonuses using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date Received</th>
                    <th className="text-left p-2">Factory</th>
                    <th className="text-left p-2">Period</th>
                    <th className="text-left p-2">Gross Bonus</th>
                    <th className="text-left p-2">Fertilizer Deductions</th>
                    <th className="text-left p-2">Net Bonus</th>
                    <th className="text-left p-2">Notes</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses.map(b => (
                    <tr key={b.id} className="border-b">
                      <td className="p-2">{b.date_received ? new Date(b.date_received).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-2">
                        <Badge variant="secondary">
                          {b.factory_name || `Factory #${b.factory_id}`}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="default">
                          {b.period}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <strong>KES {b.amount?.toLocaleString() || 0}</strong>
                      </td>
                      <td className="p-2">
                        <span className="text-amber-600">KES {b.fertilizer_deductions?.toLocaleString() || 0}</span>
                      </td>
                      <td className="p-2">
                        <strong className="text-green-600 text-lg">KES {b.net_bonus?.toLocaleString() || 0}</strong>
                      </td>
                      <td className="p-2">{b.notes || '-'}</td>
                      <td className="p-2">
                        <Button 
                          onClick={() => handleDelete(b.id)}
                          variant="destructive"
                          size="sm"
                        >
                          🗑️ Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted font-bold">
                  <tr>
                    <td colSpan="3" className="p-2">TOTALS</td>
                    <td className="p-2">KES {stats.totalAmount.toFixed(2)}</td>
                    <td className="p-2">KES {stats.totalFertilizerDeductions.toFixed(2)}</td>
                    <td className="p-2 text-green-600">KES {stats.totalNetBonus.toFixed(2)}</td>
                    <td colSpan="2" className="p-2">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Box */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">ℹ️ How Bonus System Works</h3>
          <ul className="space-y-2 pl-5">
            <li><strong>Biannual Payments:</strong> Factories pay bonuses twice per year (H1 and H2)</li>
            <li><strong>Payment Schedule:</strong>
              <ul className="ml-5 mt-2 space-y-1">
                <li><strong>H1 (First Half):</strong> Bonus for January-June production</li>
                <li><strong>H2 (Second Half):</strong> Bonus for July-December production</li>
              </ul>
            </li>
            <li><strong>Fertilizer Deductions:</strong> Cost of fertilizer purchased from factory is deducted from bonus</li>
            <li><strong>Net Bonus:</strong> Gross Bonus - Fertilizer Deductions = Amount Actually Received</li>
            <li><strong>Tracking:</strong> System helps reconcile fertilizer payments with bonus payments</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
