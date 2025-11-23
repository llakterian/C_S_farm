import { useState, useEffect } from 'react'
import { dbService } from '../services/db'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import WeatherWidget from '../components/WeatherWidget'

export default function Dashboard() {
    const [stats, setStats] = useState({
        teaKg: 0,
        milkLiters: 0,
        avocadoSales: 0,
        activeWorkers: 0
    })
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        const plucking = await dbService.getAll('tea_plucking')
        const dairy = await dbService.getAll('dairy_production')
        const avocado = await dbService.getAll('avocado_sales')
        const workers = await dbService.getAll('workers')

        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        // Stats for cards
        const teaKg = plucking
            .filter(r => new Date(r.date).getMonth() === currentMonth)
            .reduce((sum, r) => sum + r.weight, 0)

        const milkLiters = dairy
            .filter(r => new Date(r.date).getMonth() === currentMonth)
            .reduce((sum, r) => sum + r.liters, 0)

        const avocadoSales = avocado
            .filter(r => new Date(r.date).getMonth() === currentMonth)
            .reduce((sum, r) => sum + r.total, 0)

        setStats({
            teaKg,
            milkLiters,
            avocadoSales,
            activeWorkers: workers.length
        })

        // Chart Data (Last 6 months)
        const data = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const monthName = d.toLocaleString('default', { month: 'short' })
            const m = d.getMonth()
            const y = d.getFullYear()

            const t = plucking.filter(r => {
                const rd = new Date(r.date)
                return rd.getMonth() === m && rd.getFullYear() === y
            }).reduce((sum, r) => sum + r.weight, 0)

            const l = dairy.filter(r => {
                const rd = new Date(r.date)
                return rd.getMonth() === m && rd.getFullYear() === y
            }).reduce((sum, r) => sum + r.liters, 0)

            data.push({ name: monthName, Tea: t, Milk: l })
        }
        setChartData(data)
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-base font-semibold leading-6 text-gray-900">Farm Overview (This Month)</h3>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Tea Production</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.teaKg.toLocaleString()} Kg</dd>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Milk Production</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.milkLiters.toLocaleString()} L</dd>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Avocado Sales</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">KES {stats.avocadoSales.toLocaleString()}</dd>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Total Workers</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.activeWorkers}</dd>
                    </div>
                </dl>
            </div>

            {/* Weather Widget */}
            <WeatherWidget />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Production Trends (6 Months)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="Tea" stroke="#16a34a" fillOpacity={1} fill="url(#colorTea)" />
                                <Area type="monotone" dataKey="Milk" stroke="#2563eb" fillOpacity={1} fill="url(#colorMilk)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Production Comparison</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Tea" fill="#16a34a" />
                                <Bar dataKey="Milk" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
