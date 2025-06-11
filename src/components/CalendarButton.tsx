'use client'

import { useState } from 'react'
import { 
  generateGoogleCalendarLink, 
  generateOutlookCalendarLink, 
  downloadICSFile,
  MEMORIAL_EVENT 
} from '@/lib/calendar'

export default function CalendarButton() {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleGoogleCalendar = () => {
    const link = generateGoogleCalendarLink(MEMORIAL_EVENT)
    window.open(link, '_blank')
    setShowDropdown(false)
  }

  const handleOutlookCalendar = () => {
    const link = generateOutlookCalendarLink(MEMORIAL_EVENT)
    window.open(link, '_blank')
    setShowDropdown(false)
  }

  const handleDownloadICS = () => {
    downloadICSFile(MEMORIAL_EVENT)
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-6 py-3 bg-navy-600 dark:bg-lavender-600 text-stone-50 rounded-lg hover:bg-navy-700 dark:hover:bg-lavender-700 transition-all duration-200 font-medium shadow-sm"
      >
        Add to Calendar
        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-stone-50/95 dark:bg-navy-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-stone-200/80 dark:border-navy-700/80 z-10">
          <div className="py-2">
            <button
              onClick={handleGoogleCalendar}
              className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-navy-700/60 flex items-center transition-colors duration-200"
            >
              <span className="mr-3 text-base">📱</span>
              Google Calendar
            </button>
            <button
              onClick={handleOutlookCalendar}
              className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-navy-700/60 flex items-center transition-colors duration-200"
            >
              <span className="mr-3 text-base">📧</span>
              Outlook Calendar
            </button>
            <button
              onClick={handleDownloadICS}
              className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-navy-700/60 flex items-center transition-colors duration-200"
            >
              <span className="mr-3 text-base">💾</span>
              Download (.ics)
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}