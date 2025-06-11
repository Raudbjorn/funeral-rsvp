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
        <div className="text-green-600 text-xl font-semibold mb-4">
          {t.thankYou}
        </div>
        <p className="text-gray-600 mb-4">
          {t.rsvpRecorded}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-blue-600 underline"
        >
          {t.submitAnother}
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">{t.rsvpTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.name} {t.required}
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.emailOptional}
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.willYouAttend} {t.required}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === true}
                onChange={() => setFormData({...formData, attending: true})}
                className="mr-2"
              />
              {t.yesAttend}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === false}
                onChange={() => setFormData({...formData, attending: false})}
                className="mr-2"
              />
              {t.noAttend}
            </label>
          </div>
        </div>

        {formData.attending && (
          <div>
            <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
              {t.guestCount} {t.required}
            </label>
            <select
              id="guestCount"
              value={formData.guestCount}
              onChange={(e) => setFormData({...formData, guestCount: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            {t.messageOptional}
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder={t.messagePlaceholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t.submitting : t.submitRsvp}
        </button>
      </form>
    </div>
  )
}