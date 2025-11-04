import React, { useState } from 'react';

function ImportData() {
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select an Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleFullImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `http://localhost:8000/import/excel?month=${month}&year=${year}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Import failed');
      }

      const data = await response.json();
      setResult(data);
      setFile(null);
      
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkersOnlyImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/import/workers-from-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Import failed');
      }

      const data = await response.json();
      setResult(data);
      setFile(null);
      
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farm-page">
      <h1 className="farm-page-title">📊 Import Excel Data</h1>

      <div className="farm-info-box">
        <h3>📋 Import Instructions</h3>
        <ul>
          <li><strong>Workers Only:</strong> Import just worker names to populate the staff list</li>
          <li><strong>Full Import:</strong> Import workers, tea plucking records, and advances from Excel file</li>
          <li>Excel file should have worker names in column A</li>
          <li>Daily quantities in date columns (1-31)</li>
          <li>ADV rows for worker advances</li>
          <li>Supports both .xlsx and .xls file formats</li>
        </ul>
      </div>

      <div className="farm-card">
        <h2 className="farm-card-title">Select Excel File</h2>
        
        <form className="farm-form">
          <div className="farm-form-grid">
            <div className="farm-form-group farm-form-group-full">
              <label className="farm-label">Excel File *</label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="farm-input"
                disabled={loading}
              />
              {file && (
                <p className="farm-file-info">
                  Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="farm-form-group">
              <label className="farm-label">Month (for full import)</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="farm-input"
                disabled={loading}
              >
                <option value={1}>January</option>
                <option value={2}>February</option>
                <option value={3}>March</option>
                <option value={4}>April</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
            </div>

            <div className="farm-form-group">
              <label className="farm-label">Year (for full import)</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="farm-input"
                min="2020"
                max="2030"
                disabled={loading}
              />
            </div>
          </div>

          <div className="farm-button-group">
            <button
              onClick={handleWorkersOnlyImport}
              className="farm-btn farm-btn-secondary"
              disabled={loading || !file}
            >
              {loading ? '⏳ Importing...' : '👥 Import Workers Only'}
            </button>
            <button
              onClick={handleFullImport}
              className="farm-btn farm-btn-primary"
              disabled={loading || !file}
            >
              {loading ? '⏳ Importing...' : '📊 Full Import (Workers + Data)'}
            </button>
          </div>
        </form>

        {error && (
          <div className="farm-error-box">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="farm-success-box">
            <h3>✅ Import Successful!</h3>
            
            {result.summary ? (
              <div>
                <p><strong>Sheet:</strong> {result.summary.sheet_name}</p>
                <p><strong>Period:</strong> {result.summary.month}/{result.summary.year}</p>
                <p><strong>Workers Created:</strong> {result.summary.workers_created}</p>
                <p><strong>Advances Imported:</strong> {result.summary.advances_imported}</p>
                <p><strong>Tea Records Imported:</strong> {result.summary.tea_records_imported}</p>
                
                {result.summary.workers_list && result.summary.workers_list.length > 0 && (
                  <div className="farm-worker-list">
                    <strong>Created Workers:</strong>
                    <ul>
                      {result.summary.workers_list.map((name, idx) => (
                        <li key={idx}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p><strong>Workers Created:</strong> {result.workers_created}</p>
                <p><strong>Already Existing:</strong> {result.workers_existing}</p>
                <p><strong>Total Workers:</strong> {result.total_workers}</p>
                
                {result.created_list && result.created_list.length > 0 && (
                  <div className="farm-worker-list">
                    <strong>Created Workers:</strong>
                    <ul>
                      {result.created_list.map((name, idx) => (
                        <li key={idx}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .farm-file-info {
          margin-top: 8px;
          color: #2d5016;
          font-size: 14px;
        }

        .farm-button-group {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .farm-btn-secondary {
          background: #6c757d;
          flex: 1;
        }

        .farm-btn-secondary:hover {
          background: #5a6268;
        }

        .farm-btn-primary {
          flex: 1;
        }

        .farm-error-box {
          margin-top: 20px;
          padding: 15px;
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          color: #856404;
        }

        .farm-success-box {
          margin-top: 20px;
          padding: 20px;
          background: #d4edda;
          border: 2px solid #28a745;
          border-radius: 8px;
          color: #155724;
        }

        .farm-success-box h3 {
          margin-top: 0;
          margin-bottom: 15px;
        }

        .farm-success-box p {
          margin: 8px 0;
        }

        .farm-worker-list {
          margin-top: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 6px;
        }

        .farm-worker-list ul {
          margin: 10px 0 0 0;
          padding-left: 20px;
          max-height: 200px;
          overflow-y: auto;
        }

        .farm-worker-list li {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
}

export default ImportData;
