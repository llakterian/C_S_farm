import React, { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

const API_BASE = 'http://localhost:8000'

export default function Reports() {
  const [reportType, setReportType] = useState('overview')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    tea: [],
    payroll: [],
    fertilizer: [],
    avocado: [],
    dairy: [],
    poultry: [],
    staff: []
  })

  useEffect(() => {
    fetchAllData()
  }, [dateRange])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [teaRes, staffRes, fertilizerRes] = await Promise.all([
        axios.get(`${API_BASE}/teaplucking/`),
        axios.get(`${API_BASE}/staff/`),
        axios.get(`${API_BASE}/fertilizer/`)
      ])

      // Filter by date range
      const filterByDate = (records) => records.filter(r => {
        const recordDate = new Date(r.date || r.created_at)
        return recordDate >= new Date(dateRange.start) && recordDate <= new Date(dateRange.end)
      })

      setData({
        tea: filterByDate(teaRes.data),
        staff: staffRes.data,
        fertilizer: filterByDate(fertilizerRes.data)
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTeaStats = () => {
    const totalQuantity = data.tea.reduce((sum, r) => sum + r.quantity, 0)
    const totalGross = data.tea.reduce((sum, r) => sum + (r.gross_amount || 0), 0)
    const totalNet = data.tea.reduce((sum, r) => sum + (r.net_amount || 0), 0)
    const totalTransport = data.tea.reduce((sum, r) => sum + (r.transport_deduction || 0), 0)
    const avgDaily = data.tea.length > 0 ? totalQuantity / data.tea.length : 0

    return { totalQuantity, totalGross, totalNet, totalTransport, avgDaily, recordCount: data.tea.length }
  }

  const calculateFertilizerStats = () => {
    const totalQuantity = data.fertilizer.reduce((sum, r) => sum + r.quantity_kg, 0)
    const totalCost = data.fertilizer.reduce((sum, r) => sum + r.total_cost, 0)
    const deductionTotal = data.fertilizer.filter(r => r.deducted_from_salary).reduce((sum, r) => sum + r.total_cost, 0)

    return { totalQuantity, totalCost, deductionTotal, recordCount: data.fertilizer.length }
  }

  const exportOverviewPDF = () => {
    const doc = new jsPDF()
    const teaStats = calculateTeaStats()
    const fertStats = calculateFertilizerStats()

    // Header
    doc.setFontSize(22)
    doc.text('C. SAMBU FARM', 105, 20, { align: 'center' })
    doc.setFontSize(16)
    doc.text('Comprehensive Farm Report', 105, 30, { align: 'center' })
    doc.setFontSize(11)
    doc.text(`Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`, 105, 38, { align: 'center' })
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 44, { align: 'center' })

    // Tea Production Section
    doc.setFontSize(14)
    doc.setTextColor(45, 80, 22)
    doc.text('🍃 TEA PRODUCTION SUMMARY', 14, 56)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`Total Production: ${teaStats.totalQuantity.toFixed(1)} kg`, 14, 64)
    doc.text(`Number of Records: ${teaStats.recordCount}`, 14, 70)
    doc.text(`Average Daily: ${teaStats.avgDaily.toFixed(1)} kg`, 14, 76)
    doc.text(`Gross Earnings: KES ${teaStats.totalGross.toFixed(2)}`, 14, 82)
    doc.text(`Transport Deductions: KES ${teaStats.totalTransport.toFixed(2)}`, 14, 88)
    doc.text(`Net Earnings: KES ${teaStats.totalNet.toFixed(2)}`, 14, 94)

    // Fertilizer Section
    doc.setFontSize(14)
    doc.setTextColor(139, 69, 19)
    doc.text('🌱 FERTILIZER SUMMARY', 14, 106)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`Total Quantity: ${fertStats.totalQuantity.toFixed(1)} kg`, 14, 114)
    doc.text(`Total Cost: KES ${fertStats.totalCost.toFixed(2)}`, 14, 120)
    doc.text(`Deducted from Salaries: KES ${fertStats.deductionTotal.toFixed(2)}`, 14, 126)

    // Staff Section
    doc.setFontSize(14)
    doc.setTextColor(70, 130, 180)
    doc.text('👥 STAFF SUMMARY', 14, 138)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`Total Staff: ${data.staff.length}`, 14, 146)
    doc.text(`Tea Pluckers: ${data.staff.filter(s => s.pay_type === 'per_kilo').length}`, 14, 152)
    doc.text(`Fixed Salary Staff: ${data.staff.filter(s => s.pay_type === 'fixed').length}`, 14, 158)

    // Recent Tea Records Table
    if (data.tea.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(45, 80, 22)
      doc.text('Recent Tea Plucking Records', 14, 170)
      
      const tableData = data.tea.slice(-15).map(r => [
        new Date(r.date).toLocaleDateString(),
        `Worker #${r.worker_id}`,
        `${r.quantity.toFixed(1)} kg`,
        `KES ${r.gross_amount?.toFixed(2) || '0.00'}`
      ])

      doc.autoTable({
        startY: 175,
        head: [['Date', 'Worker', 'Quantity', 'Gross Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [45, 80, 22] },
        styles: { fontSize: 9 }
      })
    }

    doc.save(`farm_report_${dateRange.start}_to_${dateRange.end}.pdf`)
  }

  const teaStats = calculateTeaStats()
  const fertStats = calculateFertilizerStats()

  if (loading) {
    return <div className="farm-loading">Loading reports...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header" style={{
        background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.95) 0%, rgba(100, 149, 237, 0.95) 100%)',
        color: 'white'
      }}>
        <h1>📊 Comprehensive Reports</h1>
        <p>Analyze and export farm operation data across all departments</p>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Report Type</label>
              <select 
                className="w-full"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="overview">Farm Overview</option>
                <option value="tea">Tea Production</option>
                <option value="fertilizer">Fertilizer Usage</option>
                <option value="staff">Staff Analysis</option>
                <option value="financial">Financial Summary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={exportOverviewPDF}
                className="w-full"
              >
                📄 Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">🍃 Tea Production</div>
                <div className="text-2xl font-bold text-foreground">{teaStats.totalQuantity.toFixed(1)} kg</div>
                <div className="text-xs text-muted-foreground">{teaStats.recordCount} records</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">💰 Gross Earnings</div>
                <div className="text-2xl font-bold text-foreground">KES {teaStats.totalGross.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">From tea sales</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">💵 Net Earnings</div>
                <div className="text-2xl font-bold text-green-600">KES {teaStats.totalNet.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">After transport</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">🌱 Fertilizer Used</div>
                <div className="text-2xl font-bold text-foreground">{fertStats.totalQuantity.toFixed(1)} kg</div>
                <div className="text-xs text-muted-foreground">KES {fertStats.totalCost.toFixed(0)} total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">👥 Active Staff</div>
                <div className="text-2xl font-bold text-foreground">{data.staff.length}</div>
                <div className="text-xs text-muted-foreground">Total employees</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">📊 Avg Daily Production</div>
                <div className="text-2xl font-bold text-foreground">{teaStats.avgDaily.toFixed(1)} kg</div>
                <div className="text-xs text-muted-foreground">Per record</div>
              </CardContent>
            </Card>
          </div>

          {/* Tea Production Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>🍃 Tea Production Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">Total Production</h4>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200 mb-1">
                    {teaStats.totalQuantity.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-muted-foreground">Over {teaStats.recordCount} plucking sessions</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Transport Cost</h4>
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-1">
                    KES {teaStats.totalTransport.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total deductions @ KES 3/kg</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">Average Daily</h4>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-1">
                    {teaStats.avgDaily.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-muted-foreground">Per plucking session</p>
                </div>
              </div>

              {data.tea.length > 0 && (
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Worker ID</th>
                        <th className="text-left p-2">Factory</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Gross</th>
                        <th className="text-left p-2">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tea.slice(-10).reverse().map((r, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="p-2"><strong>#{r.worker_id}</strong></td>
                          <td className="p-2">
                            <Badge variant="secondary">{r.factory_name || 'N/A'}</Badge>
                          </td>
                          <td className="p-2">{r.quantity.toFixed(1)} kg</td>
                          <td className="p-2">KES {r.gross_amount?.toFixed(2) || '0.00'}</td>
                          <td className="p-2">
                            <strong className="text-green-600">KES {r.net_amount?.toFixed(2) || '0.00'}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fertilizer Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>🌱 Fertilizer Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-muted-foreground">Total Quantity</div>
                    <div className="text-2xl font-bold text-foreground">{fertStats.totalQuantity.toFixed(1)} kg</div>
                    <div className="text-xs text-muted-foreground">Used in period</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-muted-foreground">Total Cost</div>
                    <div className="text-2xl font-bold text-foreground">KES {fertStats.totalCost.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">All fertilizer</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-muted-foreground">Salary Deductions</div>
                    <div className="text-2xl font-bold text-amber-600">KES {fertStats.deductionTotal.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">From workers</div>
                  </CardContent>
                </Card>
              </div>

              {data.fertilizer.length > 0 && (
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-semibold mb-4">Recent Distributions</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Worker ID</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Cost</th>
                        <th className="text-left p-2">Deducted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fertilizer.slice(-10).reverse().map((r, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="p-2"><strong>#{r.worker_id}</strong></td>
                          <td className="p-2">
                            <Badge variant="default">{r.fertilizer_type}</Badge>
                          </td>
                          <td className="p-2">{r.quantity_kg.toFixed(1)} kg</td>
                          <td className="p-2">KES {r.total_cost.toFixed(2)}</td>
                          <td className="p-2">
                            {r.deducted_from_salary ? 
                              <Badge variant="secondary">Yes</Badge> : 
                              <Badge variant="outline">No</Badge>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Overview */}
          <Card>
            <CardHeader>
              <CardTitle>👥 Staff Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-muted-foreground">Total Staff</div>
                    <div className="text-2xl font-bold text-foreground">{data.staff.length}</div>
                    <div className="text-xs text-muted-foreground">All employees</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-muted-foreground">Tea Pluckers</div>
                    <div className="text-2xl font-bold text-foreground">{data.staff.filter(s => s.pay_type === 'per_kilo').length}</div>
                    <div className="text-xs text-muted-foreground">Per kilo pay</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-muted-foreground">Fixed Salary</div>
                    <div className="text-2xl font-bold text-foreground">{data.staff.filter(s => s.pay_type === 'fixed').length}</div>
                    <div className="text-xs text-muted-foreground">Monthly pay</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Financial Summary Section */}
      {reportType === 'financial' && (
        <Card>
          <CardHeader>
            <CardTitle>💰 Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
                <div className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">Total Revenue</div>
                <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-1">KES {teaStats.totalGross.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Gross earnings</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-4 rounded-lg">
                <div className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Expenses</div>
                <div className="text-2xl font-bold text-red-800 dark:text-red-200 mb-1">KES {(teaStats.totalTransport + fertStats.totalCost).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Transport + Fertilizer</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Net Income</div>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-1">KES {teaStats.totalNet.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">After deductions</div>
              </div>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Financial Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-background rounded">
                  <span>Gross Tea Sales</span>
                  <strong>KES {teaStats.totalGross.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded">
                  <span className="text-amber-600">- Transport Deductions</span>
                  <strong className="text-amber-600">KES {teaStats.totalTransport.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded">
                  <span className="text-amber-600">- Fertilizer Cost</span>
                  <strong className="text-amber-600">KES {fertStats.totalCost.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900 rounded">
                  <span className="font-semibold">Net Profit</span>
                  <strong className="text-green-600">KES {(teaStats.totalNet - fertStats.totalCost).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">ℹ️ About Reports</h3>
          <ul className="space-y-2 pl-5">
            <li><strong>Overview:</strong> Comprehensive summary of all farm operations</li>
            <li><strong>Date Range:</strong> Filter data by custom date ranges</li>
            <li><strong>PDF Export:</strong> Generate professional reports for record-keeping</li>
            <li><strong>Real-time Data:</strong> All statistics reflect current database state</li>
            <li><strong>Multiple Views:</strong> Switch between different report types for specific insights</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
