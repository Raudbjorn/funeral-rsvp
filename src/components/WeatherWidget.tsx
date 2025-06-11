'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  description: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    try {
      // For June 16, 2025, we'll show a typical summer forecast for Iceland
      // In a real implementation, you'd use OpenWeatherMap API:
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Hafnarfjörður,IS&appid=${API_KEY}&units=metric`)
      
      // Simulated typical June weather for Hafnarfjörður
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      const typicalJuneWeather: WeatherData = {
        temperature: 12,
        condition: 'Partly Cloudy',
        icon: '⛅',
        humidity: 65,
        windSpeed: 15,
        description: 'Partly cloudy with light winds - typical Icelandic summer weather'
      }
      
      setWeather(typicalJuneWeather)
    } catch (err) {
      setError('Unable to load weather forecast')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-300 dark:bg-blue-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-blue-300 dark:bg-blue-700 rounded mb-2"></div>
            <div className="h-3 bg-blue-300 dark:bg-blue-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Weather forecast unavailable
        </p>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{weather.icon}</div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {weather.temperature}°
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300">C</span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {weather.condition}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            June 16, 1:00 PM
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Hafnarfjörður
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
        <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
          <span>💧 {weather.humidity}% humidity</span>
          <span>🌬️ {weather.windSpeed} km/h</span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          {weather.description}
        </p>
      </div>
      
      <div className="mt-2 text-xs text-blue-500 dark:text-blue-400 text-center">
        ⚡ Forecast for service day
      </div>
    </div>
  )
}