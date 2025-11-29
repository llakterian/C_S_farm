import React, { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

const API_BASE = 'http://localhost:8000'

export default function Payroll() {
  const [payroll, setPayroll] = useState([])
  const [summary, setSummary] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPayroll()
  }, [month, year])

  const fetchPayroll = async () => {
    setLoading(true)
    try {
      const [payrollRes, summaryRes] = await Promise.all([
        axios.get(`${API_BASE}/payroll/month/${month}/${year}`),
        axios.get(`${API_BASE}/payroll/summary/${month}/${year}`)
      ])
      setPayroll(payrollRes.data)
      setSummary(summaryRes.data)
    } catch (error) {
      console.error('Error fetching payroll:', error)
      setPayroll([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  const calculatePayroll = async () => {
    setLoading(true)
    try {
      await axios.get(`${API_BASE}/payroll/calculate/${month}/${year}`)
      alert('Payroll calculated successfully!')
      fetchPayroll()
    } catch (error) {
      console.error('Error calculating payroll:', error)
      alert('Error calculating payroll. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const exportPayrollPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('C. SAMBU FARM', 105, 15, { align: 'center' })
    doc.setFontSize(16)
    doc.text(`Monthly Payroll Report`, 105, 25, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`${months[month - 1]} ${year}`, 105, 32, { align: 'center' })
    
    // Add summary
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40)
    
    if (summary) {
      doc.text(`Total Workers: ${summary.total_workers}`, 14, 46)
      doc.text(`Total Production: ${summary.total_kg?.toFixed(1) || 0} kg`, 14, 52)
      doc.text(`Gross Earnings: KES ${summary.total_gross?.toFixed(2) || 0}`, 14, 58)
      doc.text(`Advances: KES ${summary.total_advances?.toFixed(2) || 0}`, 14, 64)
      doc.text(`Net Payroll: KES ${summary.total_net?.toFixed(2) || 0}`, 14, 70)
    }
    
    // Add table
    const tableData = payroll.map(p => [
      `#${p.worker_id}`,
      `${p.total_kg?.toFixed(1) || 0} kg`,
      `KES ${p.gross_earnings?.toFixed(2) || 0}`,
      `KES ${p.total_advances?.toFixed(2) || 0}`,
      `KES ${p.net_pay?.toFixed(2) || 0}`
    ])
    
    doc.autoTable({
      startY: 80,
      head: [['Worker ID', 'Quantity', 'Gross', 'Advances', 'Net Pay']],
      body: tableData,
      foot: [[
        'TOTALS',
        `${payroll.reduce((sum, p) => sum + (p.total_kg || 0), 0).toFixed(1)} kg`,
        `KES ${payroll.reduce((sum, p) => sum + (p.gross_earnings || 0), 0).toFixed(2)}`,
        `KES ${payroll.reduce((sum, p) => sum + (p.total_advances || 0), 0).toFixed(2)}`,
        `KES ${payroll.reduce((sum, p) => sum + (p.net_pay || 0), 0).toFixed(2)}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [45, 80, 22] },
      footStyles: { fillColor: [245, 241, 232], textColor: [0, 0, 0], fontStyle: 'bold' }
    })
    
    doc.save(`payroll_${months[month - 1]}_${year}.pdf`)
  }

  const exportIndividualSlip = (worker) => {
    const doc = new jsPDF()
    
    // Add header
    doc.setFontSize(18)
    doc.text('C. SAMBU FARM', 105, 20, { align: 'center' })
    doc.setFontSize(14)
    doc.text('SALARY SLIP', 105, 30, { align: 'center' })
    
    // Add details
    doc.setFontSize(11)
    doc.text(`Month: ${months[month - 1]} ${year}`, 20, 45)
    doc.text(`Worker ID: #${worker.worker_id}`, 20, 52)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 59)
    
    // Add earnings table
    const earningsData = [
      ['Description', 'Amount'],
      ['Tea Plucked', `${worker.total_kg?.toFixed(1) || 0} kg`],
      ['Gross Earnings', `KES ${worker.gross_earnings?.toFixed(2) || 0}`],
      ['Advances', `KES -${worker.total_advances?.toFixed(2) || 0}`],
      ['', ''],
      ['NET PAY', `KES ${worker.net_pay?.toFixed(2) || 0}`]
    ]
    
    doc.autoTable({
      startY: 70,
      body: earningsData,
      theme: 'plain',
      styles: { fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { halign: 'right', cellWidth: 70 }
      },
      didParseCell: function(data) {
        if (data.row.index === earningsData.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fontSize = 13
        }
      }
    })
    
    // Add footer
    doc.setFontSize(9)
    doc.text('This is a computer generated document. No signature required.', 105, 280, { align: 'center' })
    
    doc.save(`salary_slip_worker${worker.worker_id}_${months[month - 1]}_${year}.pdf`)
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (loading) {
    return <div className="farm-loading">Loading payroll data...</div>
  }

  return (
    <div className="farm-fade-in">
      <div className="farm-page-header">
        <h1>💰 Monthly Payroll</h1>
        <p>View and manage monthly salary calculations with fertilizer deductions</p>
      </div>

      {/* Month/Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Select Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Month</label>
              <select 
                className="w-full"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
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
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={calculatePayroll}
                className="w-full"
              >
                🔄 Calculate Payroll
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Workers</div>
              <div className="text-2xl font-bold text-foreground">{summary.total_workers}</div>
              <div className="text-xs text-muted-foreground">Tea pluckers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Production</div>
              <div className="text-2xl font-bold text-foreground">{summary.total_kg?.toFixed(1) || 0} kg</div>
              <div className="text-xs text-muted-foreground">This month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Gross Earnings</div>
              <div className="text-2xl font-bold text-foreground">KES {summary.total_gross?.toFixed(2) || 0}</div>
              <div className="text-xs text-muted-foreground">Before deductions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Advances</div>
              <div className="text-2xl font-bold text-amber-600">KES {summary.total_advances?.toFixed(2) || 0}</div>
              <div className="text-xs text-muted-foreground">Total deductions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Net Payroll</div>
              <div className="text-2xl font-bold text-green-600">KES {summary.total_net?.toFixed(2) || 0}</div>
              <div className="text-xs text-muted-foreground">Final payout</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Details Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            💵 Payroll for {months[month - 1]} {year}
          </CardTitle>
          {payroll.length > 0 && (
            <Button 
              onClick={exportPayrollPDF}
            >
              📄 Export PDF Report
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {payroll.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💰</div>
              <p className="text-muted-foreground">No payroll data for this period.</p>
              <p className="text-sm text-muted-foreground">Click "Calculate Payroll" to generate monthly salaries.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Worker ID</th>
                    <th className="text-left p-2">Total Quantity (kg)</th>
                    <th className="text-left p-2">Gross Earnings</th>
                    <th className="text-left p-2">Advances</th>
                    <th className="text-left p-2">Net Pay</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Generated On</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((p, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2"><strong>#{p.worker_id}</strong></td>
                      <td className="p-2">{p.total_kg?.toFixed(1) || 0} kg</td>
                      <td className="p-2">KES {p.gross_earnings?.toFixed(2) || 0}</td>
                      <td className="p-2">
                        <span className="text-amber-600">KES {p.total_advances?.toFixed(2) || 0}</span>
                      </td>
                      <td className="p-2">
                        <strong className="text-green-600 text-lg">KES {p.net_pay?.toFixed(2) || 0}</strong>
                      </td>
                      <td className="p-2">
                        <Badge variant="default">Calculated</Badge>
                      </td>
                      <td className="p-2">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-2">
                        <Button 
                          onClick={() => exportIndividualSlip(p)}
                          size="sm"
                        >
                          📄 Slip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted font-bold">
                  <tr>
                    <td className="p-2">TOTALS</td>
                    <td className="p-2">{payroll.reduce((sum, p) => sum + (p.total_kg || 0), 0).toFixed(1)} kg</td>
                    <td className="p-2">KES {payroll.reduce((sum, p) => sum + (p.gross_earnings || 0), 0).toFixed(2)}</td>
                    <td className="p-2">KES {payroll.reduce((sum, p) => sum + (p.total_advances || 0), 0).toFixed(2)}</td>
                    <td className="p-2 text-green-600">KES {payroll.reduce((sum, p) => sum + (p.net_pay || 0), 0).toFixed(2)}</td>
                    <td className="p-2">-</td>
                    <td className="p-2">-</td>
                    <td className="p-2">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Box */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">ℹ️ How Payroll Works</h3>
          <ul className="space-y-2 pl-5">
            <li><strong>Gross Earnings:</strong> Total kg × Factory rate per kg</li>
            <li><strong>Transport Deduction:</strong> Already deducted in daily records (KES 3/kg)</li>
            <li><strong>Advances:</strong> Money advances given to workers during the month</li>
            <li><strong>Net Pay:</strong> Gross Earnings - Advances</li>
            <li><strong>Calculation:</strong> Click "Calculate Payroll" to generate monthly salaries</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
