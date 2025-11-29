import { useState, useEffect } from 'react'
// @ts-ignore
import { dbService } from '../services/db.js' 
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import WeatherWidget from '../components/WeatherWidget'
import VoiceButton from '../components/VoiceButton'
import { useVoice } from '../hooks/useVoice'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

interface Stats {
    teaKg: number;
    milkLiters: number;
    avocadoSales: number;
    activeWorkers: number;
}

interface ChartData {
    name: string;
    Tea: number;
    Milk: number;
}

interface TeaPluckingRecord {
    id?: number;
    worker_id: number;
    factory_id: number;
    weight: number;
    date: string;
    created_at: Date;
}

interface DairyRecord {
    id?: number;
    date: string;
    liters: number;
    sold: number;
    price: number;
}

interface AvocadoRecord {
    id?: number;
    date: string;
    kg: number;
    buyer: string;
    rate: number;
    total: number;
}

interface WorkerRecord {
    id?: number;
    name: string;
    role: string;
    phone: string;
    created_at: Date;
}

export default function Dashboard(): JSX.Element {
    const { speak, getGreeting } = useVoice()
    const [stats, setStats] = useState<Stats>({
        teaKg: 0,
        milkLiters: 0,
        avocadoSales: 0,
        activeWorkers: 0
    })
    const [chartData, setChartData] = useState<ChartData[]>([])

    useEffect(() => {
        fetchStats()
        // Voice greeting on load
        setTimeout(() => {
            speak(`${getGreeting()}! Welcome back to your farm dashboard.`)
        }, 1000)
    }, [])

    const fetchStats = async () => {
        const plucking = await dbService.getAll('tea_plucking') as TeaPluckingRecord[]
        const dairy = await dbService.getAll('dairy_production') as DairyRecord[]
        const avocado = await dbService.getAll('avocado_sales') as AvocadoRecord[]
        const workers = await dbService.getAll('workers') as WorkerRecord[]

        const currentMonth = new Date().getMonth()

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
        const data: ChartData[] = []
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
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold leading-6 text-foreground">Farm Overview (This Month)</h3>
                <VoiceButton />
            </div>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <dt className="truncate text-sm font-medium text-muted-foreground">Tea Production</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{stats.teaKg.toLocaleString()} Kg</dd>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <dt className="truncate text-sm font-medium text-muted-foreground">Milk Production</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{stats.milkLiters.toLocaleString()} L</dd>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <dt className="truncate text-sm font-medium text-muted-foreground">Avocado Sales</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">KES {stats.avocadoSales.toLocaleString()}</dd>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <dt className="truncate text-sm font-medium text-muted-foreground">Total Workers</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{stats.activeWorkers}</dd>
                    </CardContent>
                </Card>
            </dl>

            {/* Weather Widget */}
            <WeatherWidget />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Production Trends (6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Production Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}
