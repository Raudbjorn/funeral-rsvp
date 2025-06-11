'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  const themes = [
    { id: 'light', icon: '☀️', label: 'Light' },
    { id: 'dark', icon: '🌙', label: 'Dark' },
    { id: 'system', icon: '💻', label: 'System' }
  ]

  return (
    <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
      {themes.map((themeOption) => (
        <button
          key={themeOption.id}
          onClick={() => setTheme(themeOption.id)}
          className={`p-2 text-sm font-medium rounded-md transition-colors ${
            theme === themeOption.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={themeOption.label}
        >
          <span className="text-lg">{themeOption.icon}</span>
        </button>
      ))}
    </div>
  )
}