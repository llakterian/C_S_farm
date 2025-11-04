import React, { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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
      <div className="farm-card">
        <div className="farm-card-header">
          <h2 className="farm-card-title">⚙️ Report Configuration</h2>
        </div>

        <div className="farm-form" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
          <div className="farm-form-group">
            <label className="farm-form-label">Report Type</label>
            <select 
              className="farm-select"
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

          <div className="farm-form-group">
            <label className="farm-form-label">Start Date</label>
            <input
              className="farm-input"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>

          <div className="farm-form-group">
            <label className="farm-form-label">End Date</label>
            <input
              className="farm-input"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>

          <div className="farm-form-group" style={{display: 'flex', alignItems: 'flex-end'}}>
            <button 
              onClick={exportOverviewPDF}
              className="farm-btn farm-btn-primary"
              style={{width: '100%'}}
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="farm-summary-grid">
            <div className="farm-summary-box">
              <div className="farm-summary-title">🍃 Tea Production</div>
              <div className="farm-summary-value">{teaStats.totalQuantity.toFixed(1)} kg</div>
              <div className="farm-summary-label">{teaStats.recordCount} records</div>
            </div>
            <div className="farm-summary-box">
              <div className="farm-summary-title">💰 Gross Earnings</div>
              <div className="farm-summary-value">KES {teaStats.totalGross.toFixed(0)}</div>
              <div className="farm-summary-label">From tea sales</div>
            </div>
            <div className="farm-summary-box">
              <div className="farm-summary-title">💵 Net Earnings</div>
              <div className="farm-summary-value" style={{color: 'var(--farm-green)'}}>
                KES {teaStats.totalNet.toFixed(0)}
              </div>
              <div className="farm-summary-label">After transport</div>
            </div>
            <div className="farm-summary-box">
              <div className="farm-summary-title">🌱 Fertilizer Used</div>
              <div className="farm-summary-value">{fertStats.totalQuantity.toFixed(1)} kg</div>
              <div className="farm-summary-label">KES {fertStats.totalCost.toFixed(0)} total</div>
            </div>
            <div className="farm-summary-box">
              <div className="farm-summary-title">👥 Active Staff</div>
              <div className="farm-summary-value">{data.staff.length}</div>
              <div className="farm-summary-label">Total employees</div>
            </div>
            <div className="farm-summary-box">
              <div className="farm-summary-title">📊 Avg Daily Production</div>
              <div className="farm-summary-value">{teaStats.avgDaily.toFixed(1)} kg</div>
              <div className="farm-summary-label">Per record</div>
            </div>
          </div>

          {/* Tea Production Analysis */}
          <div className="farm-card">
            <div className="farm-card-header">
              <h2 className="farm-card-title">🍃 Tea Production Analysis</h2>
            </div>

            <div style={{padding: '1.5rem'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem'}}>
                <div style={{background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', padding: '1.5rem', borderRadius: '8px'}}>
                  <h4 style={{margin: '0 0 0.5rem 0', color: 'var(--farm-green)'}}>Total Production</h4>
                  <p style={{fontSize: '2rem', fontWeight: 'bold', margin: '0', color: 'var(--farm-green)'}}>
                    {teaStats.totalQuantity.toFixed(1)} kg
                  </p>
                  <p style={{margin: '0.5rem 0 0 0', color: '#666'}}>Over {teaStats.recordCount} plucking sessions</p>
                </div>

                <div style={{background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', padding: '1.5rem', borderRadius: '8px'}}>
                  <h4 style={{margin: '0 0 0.5rem 0', color: 'var(--farm-brown)'}}>Transport Cost</h4>
                  <p style={{fontSize: '2rem', fontWeight: 'bold', margin: '0', color: 'var(--farm-brown)'}}>
                    KES {teaStats.totalTransport.toFixed(2)}
                  </p>
                  <p style={{margin: '0.5rem 0 0 0', color: '#666'}}>Total deductions @ KES 3/kg</p>
                </div>

                <div style={{background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', padding: '1.5rem', borderRadius: '8px'}}>
                  <h4 style={{margin: '0 0 0.5rem 0', color: '#7b1fa2'}}>Average Daily</h4>
                  <p style={{fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#7b1fa2'}}>
                    {teaStats.avgDaily.toFixed(1)} kg
                  </p>
                  <p style={{margin: '0.5rem 0 0 0', color: '#666'}}>Per plucking session</p>
                </div>
              </div>

              {data.tea.length > 0 && (
                <div style={{overflowX: 'auto'}}>
                  <h4 style={{marginBottom: '1rem'}}>Recent Activity</h4>
                  <table className="farm-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Worker ID</th>
                        <th>Factory</th>
                        <th>Quantity</th>
                        <th>Gross</th>
                        <th>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tea.slice(-10).reverse().map((r, i) => (
                        <tr key={i}>
                          <td>{new Date(r.date).toLocaleDateString()}</td>
                          <td><strong>#{r.worker_id}</strong></td>
                          <td><span className="farm-badge farm-badge-info">{r.factory_name || 'N/A'}</span></td>
                          <td>{r.quantity.toFixed(1)} kg</td>
                          <td>KES {r.gross_amount?.toFixed(2) || '0.00'}</td>
                          <td><strong style={{color: 'var(--farm-green)'}}>KES {r.net_amount?.toFixed(2) || '0.00'}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Fertilizer Analysis */}
          <div className="farm-card">
            <div className="farm-card-header">
              <h2 className="farm-card-title">🌱 Fertilizer Analysis</h2>
            </div>

            <div style={{padding: '1.5rem'}}>
              <div className="farm-summary-grid">
                <div className="farm-summary-box">
                  <div className="farm-summary-title">Total Quantity</div>
                  <div className="farm-summary-value">{fertStats.totalQuantity.toFixed(1)} kg</div>
                  <div className="farm-summary-label">Used in period</div>
                </div>
                <div className="farm-summary-box">
                  <div className="farm-summary-title">Total Cost</div>
                  <div className="farm-summary-value">KES {fertStats.totalCost.toFixed(2)}</div>
                  <div className="farm-summary-label">All fertilizer</div>
                </div>
                <div className="farm-summary-box">
                  <div className="farm-summary-title">Salary Deductions</div>
                  <div className="farm-summary-value">KES {fertStats.deductionTotal.toFixed(2)}</div>
                  <div className="farm-summary-label">From workers</div>
                </div>
              </div>

              {data.fertilizer.length > 0 && (
                <div style={{overflowX: 'auto', marginTop: '1.5rem'}}>
                  <h4 style={{marginBottom: '1rem'}}>Recent Distributions</h4>
                  <table className="farm-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Worker ID</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Cost</th>
                        <th>Deducted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fertilizer.slice(-10).reverse().map((r, i) => (
                        <tr key={i}>
                          <td>{new Date(r.date).toLocaleDateString()}</td>
                          <td><strong>#{r.worker_id}</strong></td>
                          <td><span className="farm-badge farm-badge-success">{r.fertilizer_type}</span></td>
                          <td>{r.quantity_kg.toFixed(1)} kg</td>
                          <td>KES {r.total_cost.toFixed(2)}</td>
                          <td>
                            {r.deducted_from_salary ? 
                              <span className="farm-badge farm-badge-warning">Yes</span> : 
                              <span className="farm-badge farm-badge-info">No</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Staff Overview */}
          <div className="farm-card">
            <div className="farm-card-header">
              <h2 className="farm-card-title">👥 Staff Overview</h2>
            </div>

            <div className="farm-summary-grid">
              <div className="farm-summary-box">
                <div className="farm-summary-title">Total Staff</div>
                <div className="farm-summary-value">{data.staff.length}</div>
                <div className="farm-summary-label">All employees</div>
              </div>
              <div className="farm-summary-box">
                <div className="farm-summary-title">Tea Pluckers</div>
                <div className="farm-summary-value">{data.staff.filter(s => s.pay_type === 'per_kilo').length}</div>
                <div className="farm-summary-label">Per kilo pay</div>
              </div>
              <div className="farm-summary-box">
                <div className="farm-summary-title">Fixed Salary</div>
                <div className="farm-summary-value">{data.staff.filter(s => s.pay_type === 'fixed').length}</div>
                <div className="farm-summary-label">Monthly pay</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Financial Summary Section */}
      {reportType === 'financial' && (
        <div className="farm-card">
          <div className="farm-card-header">
            <h2 className="farm-card-title">💰 Financial Summary</h2>
          </div>

          <div style={{padding: '1.5rem'}}>
            <div className="farm-summary-grid">
              <div className="farm-summary-box" style={{background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)'}}>
                <div className="farm-summary-title">Total Revenue</div>
                <div className="farm-summary-value">KES {teaStats.totalGross.toFixed(2)}</div>
                <div className="farm-summary-label">Gross earnings</div>
              </div>
              <div className="farm-summary-box" style={{background: 'linear-gradient(135deg, #ffccbc 0%, #ffab91 100%)'}}>
                <div className="farm-summary-title">Expenses</div>
                <div className="farm-summary-value">KES {(teaStats.totalTransport + fertStats.totalCost).toFixed(2)}</div>
                <div className="farm-summary-label">Transport + Fertilizer</div>
              </div>
              <div className="farm-summary-box" style={{background: 'linear-gradient(135deg, #b2dfdb 0%, #80cbc4 100%)'}}>
                <div className="farm-summary-title">Net Income</div>
                <div className="farm-summary-value">KES {teaStats.totalNet.toFixed(2)}</div>
                <div className="farm-summary-label">After deductions</div>
              </div>
            </div>

            <div style={{marginTop: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '8px'}}>
              <h3 style={{marginBottom: '1rem'}}>Financial Breakdown</h3>
              <div style={{display: 'grid', gap: '0.75rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'white', borderRadius: '4px'}}>
                  <span>Gross Tea Sales</span>
                  <strong>KES {teaStats.totalGross.toFixed(2)}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'white', borderRadius: '4px'}}>
                  <span>Transport Deductions</span>
                  <strong style={{color: 'var(--farm-brown)'}}>- KES {teaStats.totalTransport.toFixed(2)}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'white', borderRadius: '4px'}}>
                  <span>Fertilizer Cost</span>
                  <strong style={{color: 'var(--farm-brown)'}}>- KES {fertStats.totalCost.toFixed(2)}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--farm-green)', color: 'white', borderRadius: '4px', fontSize: '1.1rem'}}>
                  <span>Net Profit</span>
                  <strong>KES {(teaStats.totalNet - fertStats.totalCost).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Card */}
      <div className="farm-card" style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'}}>
        <h3 style={{color: 'var(--farm-green)', marginBottom: '1rem'}}>ℹ️ About Reports</h3>
        <ul style={{paddingLeft: '1.5rem', lineHeight: '2'}}>
          <li><strong>Overview:</strong> Comprehensive summary of all farm operations</li>
          <li><strong>Date Range:</strong> Filter data by custom date ranges</li>
          <li><strong>PDF Export:</strong> Generate professional reports for record-keeping</li>
          <li><strong>Real-time Data:</strong> All statistics reflect current database state</li>
          <li><strong>Multiple Views:</strong> Switch between different report types for specific insights</li>
        </ul>
      </div>
    </div>
  )
}
