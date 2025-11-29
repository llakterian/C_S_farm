import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

const API_BASE = 'http://localhost:8000'

export default function Poultry() {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({ type: 'eggs', quantity: 0, date: '', notes: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/poultry/`)
      setRecords(res.data)
    } catch (error) {
      console.error('Error fetching poultry records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/poultry/`, {
        ...form,
        quantity: parseFloat(form.quantity),
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString()
      })
      setForm({ type: 'eggs', quantity: 0, date: '', notes: '' })
      fetchRecords()
      alert('Poultry record added successfully!')
    } catch (error) {
      console.error('Error adding record:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      await axios.delete(`${API_BASE}/poultry/${id}`)
      fetchRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const calculateStats = () => {
    const today = new Date().toDateString()
    const todayRecords = records.filter(r => new Date(r.date).toDateString() === today)
    
    const totalEggs = records.filter(r => r.type === 'eggs').reduce((sum, r) => sum + r.quantity, 0)
    const todayEggs = todayRecords.filter(r => r.type === 'eggs').reduce((sum, r) => sum + r.quantity, 0)
    
    return { totalEggs, todayEggs, total: records.length }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="farm-loading">Loading poultry data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>🐔 Poultry Management</h1>
        <p>Track egg production and poultry activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Today's Eggs</div>
            <div className="text-2xl font-bold text-foreground">{stats.todayEggs}</div>
            <div className="text-xs text-muted-foreground">Fresh eggs collected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Eggs</div>
            <div className="text-2xl font-bold text-foreground">{stats.totalEggs}</div>
            <div className="text-xs text-muted-foreground">All time production</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Records</div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">All activities</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>➕ Add Poultry Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type</label>
              <select 
                className="w-full"
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value})}
              >
                <option value="eggs">Eggs Collected</option>
                <option value="feed">Feed Given</option>
                <option value="sales">Birds Sold</option>
                <option value="mortality">Mortality</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
              <Input 
                type="number" 
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
              <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
              <Input 
                type="text" 
                value={form.notes} 
                onChange={e => setForm({...form, notes: e.target.value})} 
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">➕ Add Record</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Poultry Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🐔</div>
              <p className="text-muted-foreground">No poultry records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Quantity</th>
                    <th className="text-left p-2">Notes</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant="default">{r.type}</Badge>
                      </td>
                      <td className="p-2">
                        <strong>{r.quantity}</strong>
                      </td>
                      <td className="p-2">{r.notes || '-'}</td>
                      <td className="p-2">
                        <Button 
                          onClick={() => handleDelete(r.id)} 
                          variant="destructive" 
                          size="sm"
                        >
                          🗑️
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
