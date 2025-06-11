'use client'

import { useState } from 'react'
import { RSVP } from '@/types'
import { Language, useTranslation } from '@/lib/i18n'

interface RSVPFormProps {
  language: Language
}

export default function RSVPForm({ language }: RSVPFormProps) {
  const t = useTranslation(language)
  const [formData, setFormData] = useState<Partial<RSVP>>({
    name: '',
    email: '',
    attending: true,
    guestCount: 1,
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          attending: true,
          guestCount: 1,
          message: ''
        })
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-navy-700 dark:text-lavender-400 text-xl font-semibold mb-4">
          {t.thankYou}
        </div>
        <p className="text-stone-600 dark:text-stone-300 mb-4">
          {t.rsvpRecorded}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-navy-600 dark:text-lavender-400 underline hover:text-navy-700 dark:hover:text-lavender-300 transition-colors"
        >
          {t.submitAnother}
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-serif font-semibold mb-6 text-navy-800 dark:text-stone-100">{t.rsvpTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {t.name} {t.required}
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 dark:border-navy-600 rounded-lg bg-stone-50 dark:bg-navy-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-navy-500 dark:focus:ring-lavender-500 transition-colors text-base"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {t.emailOptional}
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 dark:border-navy-600 rounded-lg bg-stone-50 dark:bg-navy-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-navy-500 dark:focus:ring-lavender-500 transition-colors text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {t.willYouAttend} {t.required}
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-stone-200 dark:border-navy-700 rounded-lg hover:bg-stone-50 dark:hover:bg-navy-800/50 transition-colors cursor-pointer">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === true}
                onChange={() => setFormData({...formData, attending: true})}
                className="mr-3 w-4 h-4 text-navy-600 dark:text-lavender-500"
              />
              {t.yesAttend}
            </label>
            <label className="flex items-center p-3 border border-stone-200 dark:border-navy-700 rounded-lg hover:bg-stone-50 dark:hover:bg-navy-800/50 transition-colors cursor-pointer">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === false}
                onChange={() => setFormData({...formData, attending: false})}
                className="mr-3 w-4 h-4 text-navy-600 dark:text-lavender-500"
              />
              {t.noAttend}
            </label>
          </div>
        </div>

        {formData.attending && (
          <div>
            <label htmlFor="guestCount" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              {t.guestCount} {t.required}
            </label>
            <select
              id="guestCount"
              value={formData.guestCount}
              onChange={(e) => setFormData({...formData, guestCount: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-navy-600 rounded-lg bg-stone-50 dark:bg-navy-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-navy-500 dark:focus:ring-lavender-500 transition-colors text-base resize-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {t.messageOptional}
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder={t.messagePlaceholder}
            className="w-full px-4 py-3 border border-stone-300 dark:border-navy-600 rounded-lg bg-stone-50 dark:bg-navy-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-navy-500 dark:focus:ring-lavender-500 transition-colors text-base resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-navy-600 dark:bg-lavender-600 text-stone-50 py-3 px-6 rounded-lg hover:bg-navy-700 dark:hover:bg-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-base shadow-sm"
        >
          {isSubmitting ? t.submitting : t.submitRsvp}
        </button>
      </form>
    </div>
  )
}