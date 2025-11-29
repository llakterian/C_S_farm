// CSV Export Utility for C. Sambu Farm Manager

export const exportService = {
    // Convert array of objects to CSV
    arrayToCSV(data, headers = null) {
        if (!data || data.length === 0) return '';

        // Use provided headers or extract from first object
        const keys = headers || Object.keys(data[0]);

        // Create header row
        const headerRow = keys.join(',');

        // Create data rows
        const dataRows = data.map(item => {
            return keys.map(key => {
                const value = item[key];
                // Handle values with commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            }).join(',');
        });

        return [headerRow, ...dataRows].join('\n');
    },

    // Download CSV file
    downloadCSV(data, filename, headers = null) {
        const csv = this.arrayToCSV(data, headers);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },

    // Export payroll to CSV
    exportPayroll(payrollData, month, year) {
        const filename = `payroll_${month}_${year}.csv`;
        const headers = ['Worker Name', 'Role', 'Details', 'Total Pay (KES)'];
        const data = payrollData.map(p => ({
            'Worker Name': p.worker_name,
            'Role': p.role,
            'Details': p.details,
            'Total Pay (KES)': p.total_pay
        }));
        this.downloadCSV(data, filename, headers);
    },

    // Export expenses to CSV
    exportExpenses(expensesData, month, year) {
        const filename = `expenses_${month}_${year}.csv`;
        const headers = ['Date', 'Category', 'Description', 'Amount (KES)'];
        const data = expensesData.map(e => ({
            'Date': e.date,
            'Category': e.category,
            'Description': e.description,
            'Amount (KES)': e.amount
        }));
        this.downloadCSV(data, filename, headers);
    },

    // Export plucking records to CSV
    exportPlucking(pluckingData, month, year) {
        const filename = `plucking_${month}_${year}.csv`;
        const headers = ['Date', 'Worker', 'Factory', 'Weight (Kg)'];
        const data = pluckingData.map(p => ({
            'Date': p.date,
            'Worker': p.worker_name,
            'Factory': p.factory_name,
            'Weight (Kg)': p.weight
        }));
        this.downloadCSV(data, filename, headers);
    },

    // Export annual report to CSV
    exportAnnualReport(reportData, year) {
        const filename = `annual_report_${year}.csv`;
        const headers = ['Month', 'Tea (Kg)', 'Milk (L)', 'Avocado (KES)'];
        const data = reportData.map(m => ({
            'Month': m.month,
            'Tea (Kg)': m.teaKg,
            'Milk (L)': m.milkLiters,
            'Avocado (KES)': m.avocadoIncome
        }));
        this.downloadCSV(data, filename, headers);
    },

    // Generic export for any data
    exportGeneric(data, filename) {
        this.downloadCSV(data, filename);
    }
};
