import React, { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">📅 Select Period</h2>
        </div>
        
        <div className="farm-form" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
          <div className="farm-form-group">
            <label className="farm-form-label">Month</label>
            <select 
              className="farm-select"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">Year</label>
            <input
              className="farm-input"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min="2020"
              max="2030"
            />
          </div>

          <div className="farm-form-group" style={{display: 'flex', alignItems: 'flex-end'}}>
            <button 
              onClick={calculatePayroll}
              className="farm-btn farm-btn-secondary"
              style={{width: '100%'}}
            >
              🔄 Calculate Payroll
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="farm-summary-grid">
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Workers</div>
            <div className="farm-summary-value">{summary.total_workers}</div>
            <div className="farm-summary-label">Tea pluckers</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Total Production</div>
            <div className="farm-summary-value">{summary.total_kg?.toFixed(1) || 0} kg</div>
            <div className="farm-summary-label">This month</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Gross Earnings</div>
            <div className="farm-summary-value">KES {summary.total_gross?.toFixed(2) || 0}</div>
            <div className="farm-summary-label">Before deductions</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Advances</div>
            <div className="farm-summary-value">KES {summary.total_advances?.toFixed(2) || 0}</div>
            <div className="farm-summary-label">Total deductions</div>
          </div>
          <div className="farm-summary-box">
            <div className="farm-summary-title">Net Payroll</div>
            <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>
              KES {summary.total_net?.toFixed(2) || 0}
            </div>
            <div className="farm-summary-label">Final payout</div>
          </div>
        </div>
      )}

      {/* Payroll Details Table */}
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">
            💵 Payroll for {months[month - 1]} {year}
          </h2>
          {payroll.length > 0 && (
            <button 
              onClick={exportPayrollPDF}
              className="farm-btn farm-btn-primary"
              style={{marginLeft: 'auto'}}
            >
              📄 Export PDF Report
            </button>
          )}
        </div>

        {payroll.length === 0 ? (
          <div className="farm-empty-state">
            <div className="farm-empty-icon">💰</div>
            <p>No payroll data for this period.</p>
            <p>Click "Calculate Payroll" to generate monthly salaries.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Worker ID</th>
                  <th>Total Quantity (kg)</th>
                  <th>Gross Earnings</th>
                  <th>Advances</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Generated On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((p, index) => (
                  <tr key={index}>
                    <td><strong>#{p.worker_id}</strong></td>
                    <td>{p.total_kg?.toFixed(1) || 0} kg</td>
                    <td>KES {p.gross_earnings?.toFixed(2) || 0}</td>
                    <td style={{color: 'var(--farm-brown)'}}>
                      KES {p.total_advances?.toFixed(2) || 0}
                    </td>
                    <td>
                      <strong style={{color: 'var(--farm-green)', fontSize: '1.1rem'}}>
                        KES {p.net_pay?.toFixed(2) || 0}
                      </strong>
                    </td>
                    <td>
                      <span className="farm-badge farm-badge-success">Calculated</span>
                    </td>
                    <td>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <button 
                        onClick={() => exportIndividualSlip(p)}
                        className="farm-btn farm-btn-primary"
                        style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem'}}
                      >
                        📄 Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{backgroundColor: 'var(--farm-cream)', fontWeight: 'bold'}}>
                <tr>
                  <td>TOTALS</td>
                  <td>{payroll.reduce((sum, p) => sum + (p.total_kg || 0), 0).toFixed(1)} kg</td>
                  <td>KES {payroll.reduce((sum, p) => sum + (p.gross_earnings || 0), 0).toFixed(2)}</td>
                  <td>KES {payroll.reduce((sum, p) => sum + (p.total_advances || 0), 0).toFixed(2)}</td>
                  <td style={{color: 'var(--farm-green)'}}>
                    KES {payroll.reduce((sum, p) => sum + (p.net_pay || 0), 0).toFixed(2)}
                  </td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="farm-card" style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'}}>
        <h3 style={{color: 'var(--farm-green)', marginBottom: '1rem'}}>ℹ️ How Payroll Works</h3>
        <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
          <li><strong>Gross Earnings:</strong> Total kg × Factory rate per kg</li>
          <li><strong>Transport Deduction:</strong> Already deducted in daily records (KES 3/kg)</li>
          <li><strong>Advances:</strong> Money advances given to workers during the month</li>
          <li><strong>Net Pay:</strong> Gross Earnings - Advances</li>
          <li><strong>Calculation:</strong> Click "Calculate Payroll" to generate monthly salaries</li>
        </ul>
      </div>
    </div>
  )
}
