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
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        📅 Add to Calendar
        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={handleGoogleCalendar}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="mr-2">📱</span>
              Google Calendar
            </button>
            <button
              onClick={handleOutlookCalendar}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="mr-2">📧</span>
              Outlook Calendar
            </button>
            <button
              onClick={handleDownloadICS}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="mr-2">💾</span>
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