'use client'

import { Language } from '@/lib/i18n'

interface LanguageToggleProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export default function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          currentLanguage === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
        }`}
      >
        🇺🇸 EN
      </button>
      <button
        onClick={() => onLanguageChange('is')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          currentLanguage === 'is'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
        }`}
      >
        🇮🇸 IS
      </button>
    </div>
  )
}