'use client'

import { useState } from 'react'

export default function SocialShare() {
  const [showDropdown, setShowDropdown] = useState(false)

  const shareData = {
    title: 'Funeral - Fríkirkjan í Hafnarfirði',
    text: 'Join us for a funeral service on June 16, 2025 at 1:00 PM at Fríkirkjan í Hafnarfirði.',
    url: typeof window !== 'undefined' ? window.location.href : ''
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setShowDropdown(false)
  }

  const handleInstagramShare = () => {
    // Instagram doesn't have a direct URL sharing mechanism like Facebook
    // The best we can do is copy the text and prompt user to share
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`).then(() => {
        alert('Text copied to clipboard! You can now paste it in your Instagram story or post.')
      }).catch(() => {
        fallbackCopyText(`${shareData.text}\n\n${shareData.url}`)
      })
    } else {
      fallbackCopyText(`${shareData.text}\n\n${shareData.url}`)
    }
    setShowDropdown(false)
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData)
        setShowDropdown(false)
      } catch (err) {
        console.log('Error sharing:', err)
      }
    }
  }

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Text copied to clipboard! You can now paste it in your Instagram story or post.')
  }

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Link copied to clipboard!')
      }).catch(() => {
        fallbackCopyText(shareData.url)
      })
    } else {
      fallbackCopyText(shareData.url)
    }
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-6 py-3 bg-lavender-600 dark:bg-navy-600 text-stone-50 rounded-lg hover:bg-lavender-700 dark:hover:bg-navy-700 transition-all duration-200 font-medium shadow-sm"
      >
        📱 Share
        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-stone-50/95 dark:bg-navy-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-stone-200/80 dark:border-navy-700/80 z-10">
          <div className="py-2">
            <button
              onClick={handleFacebookShare}
              className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-navy-700/60 flex items-center transition-colors duration-200"
            >
              <span className="mr-2">📘</span>
              Share on Facebook
            </button>
            <button
              onClick={handleInstagramShare}
              className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-navy-700/60 flex items-center transition-colors duration-200"
            >
              <span className="mr-2">📷</span>
              Copy for Instagram
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-navy-700/60 flex items-center transition-colors duration-200"
              >
                <span className="mr-2">📤</span>
                Share via Apps
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-navy-700/60 flex items-center transition-colors duration-200"
            >
              <span className="mr-2">🔗</span>
              Copy Link
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