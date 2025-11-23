import { dbService } from './db';

export const payrollService = {
    async calculatePayroll(month, year) {
        const workers = await dbService.getAll('workers');
        const pluckingRecords = await dbService.getAll('tea_plucking');
        const laborLogs = await dbService.getAll('labor_logs');

        const payrolls = [];

        for (const worker of workers) {
            let totalPay = 0;
            let details = [];

            // 1. Tea Plucking (KES 8 per Kg)
            const workerPlucking = pluckingRecords.filter(r => {
                const d = new Date(r.date);
                return r.worker_id === worker.id &&
                    d.getMonth() + 1 === parseInt(month) &&
                    d.getFullYear() === parseInt(year);
            });

            const totalKg = workerPlucking.reduce((sum, r) => sum + r.weight, 0);
            const teaPay = totalKg * 8;
            if (teaPay > 0) {
                totalPay += teaPay;
                details.push(`Tea: ${totalKg}kg * 8 = ${teaPay}`);
            }

            // 2. Hourly Labor
            const workerLabor = laborLogs.filter(r => {
                const d = new Date(r.date);
                return r.worker_id === worker.id &&
                    d.getMonth() + 1 === parseInt(month) &&
                    d.getFullYear() === parseInt(year);
            });

            let dairyPay = 0;
            let manualPay = 0;

            workerLabor.forEach(log => {
                if (log.task_type === 'dairy') {
                    dairyPay += log.hours * 233;
                } else if (log.task_type === 'manual') {
                    manualPay += log.hours * 216;
                }
            });

            if (dairyPay > 0) {
                totalPay += dairyPay;
                details.push(`Dairy: ${dairyPay} (Rate: 233/hr)`);
            }
            if (manualPay > 0) {
                totalPay += manualPay;
                details.push(`Manual: ${manualPay} (Rate: 216/hr)`);
            }

            // 3. Fixed Salary (Watchman / Supervisor)
            if (worker.role === 'Watchman' || worker.role === 'Supervisor') {
                const fixedPay = 7500;
                totalPay += fixedPay;
                details.push(`Fixed (${worker.role}): ${fixedPay}`);
            }

            payrolls.push({
                worker_id: worker.id,
                worker_name: worker.name,
                role: worker.role,
                month,
                year,
                total_pay: totalPay,
                details: details.join(', '),
                status: 'calculated'
            });
        }

        return payrolls;
    }
};
