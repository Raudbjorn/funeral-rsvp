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
      <div className="flex items-center space-x-1 bg-stone-50/90 dark:bg-navy-800/90 backdrop-blur-sm rounded-lg shadow-sm border border-stone-200/60 dark:border-navy-700/60 p-1">
        <div className="w-8 h-8 bg-stone-200 dark:bg-navy-700 rounded animate-pulse" />
        <div className="w-8 h-8 bg-stone-200 dark:bg-navy-700 rounded animate-pulse" />
        <div className="w-8 h-8 bg-stone-200 dark:bg-navy-700 rounded animate-pulse" />
      </div>
    )
  }

  const themes = [
    { id: 'light', icon: '☀️', label: 'Light' },
    { id: 'dark', icon: '🌙', label: 'Dark' },
    { id: 'system', icon: '💻', label: 'System' }
  ]

  return (
    <div className="flex items-center space-x-1 bg-stone-50/90 dark:bg-navy-800/90 backdrop-blur-sm rounded-lg shadow-sm border border-stone-200/60 dark:border-navy-700/60 p-1">
      {themes.map((themeOption) => (
        <button
          key={themeOption.id}
          onClick={() => setTheme(themeOption.id)}
          className={`p-2 text-sm font-medium rounded-md transition-colors ${
            theme === themeOption.id
              ? 'bg-navy-600 dark:bg-lavender-600 text-stone-50'
              : 'text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100/60 dark:hover:bg-navy-700/60'
          }`}
          title={themeOption.label}
        >
          <span className="text-lg">{themeOption.icon}</span>
        </button>
      ))}
    </div>
  )
}