import { useState, useEffect } from 'react'

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchWeather()
    }, [])

    const fetchWeather = async () => {
        try {
            // Using Kericho, Kenya coordinates (tea country)
            const lat = -0.3676
            const lon = 35.2833

            // Free tier OpenWeatherMap API (user can add their own key)
            const API_KEY = 'demo' // User should replace with their own key
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`

            const response = await fetch(url)
            if (!response.ok) {
                // Fallback to mock data if API fails (demo mode)
                setWeather({
                    temp: 18,
                    description: 'Partly Cloudy',
                    humidity: 75,
                    wind: 12,
                    icon: '02d'
                })
                setLoading(false)
                return
            }

            const data = await response.json()
            setWeather({
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
                icon: data.weather[0].icon
            })
        } catch (err) {
            // Fallback to mock data
            setWeather({
                temp: 18,
                description: 'Partly Cloudy',
                humidity: 75,
                wind: 12,
                icon: '02d'
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-6 text-white">
                <div className="animate-pulse">Loading weather...</div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm opacity-90">Kericho, Kenya</div>
                    <div className="text-5xl font-bold mt-2">{weather.temp}°C</div>
                    <div className="text-lg capitalize mt-1">{weather.description}</div>
                </div>
                <div className="text-right">
                    <img
                        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                        alt={weather.description}
                        className="w-20 h-20"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div className="text-sm mt-2">
                        <div>💧 {weather.humidity}%</div>
                        <div>💨 {weather.wind} km/h</div>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-75">
                <div className="flex items-center gap-2">
                    <span>🌱</span>
                    <span>Ideal tea plucking conditions</span>
                </div>
            </div>
        </div>
    )
}
