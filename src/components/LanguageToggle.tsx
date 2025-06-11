'use client'

import { Language } from '@/lib/i18n'

interface LanguageToggleProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export default function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-stone-50/90 dark:bg-navy-800/90 backdrop-blur-sm rounded-lg shadow-sm border border-stone-200/60 dark:border-navy-700/60 p-1">
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          currentLanguage === 'en'
            ? 'bg-navy-600 dark:bg-lavender-600 text-stone-50'
            : 'text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100'
        }`}
      >
        🇺🇸 EN
      </button>
      <button
        onClick={() => onLanguageChange('is')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          currentLanguage === 'is'
            ? 'bg-navy-600 dark:bg-lavender-600 text-stone-50'
            : 'text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100'
        }`}
      >
        🇮🇸 IS
      </button>
    </div>
  )
}