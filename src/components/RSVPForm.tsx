'use client'

import { useState } from 'react'
import { RSVP } from '@/types'

export default function RSVPForm() {
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
          Thank you for responding!
        </div>
        <p className="text-gray-600 mb-4">
          Your RSVP has been recorded.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-blue-600 underline"
        >
          Submit another response
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">RSVP</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Will you be attending? *
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
              Yes, I will attend
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === false}
                onChange={() => setFormData({...formData, attending: false})}
                className="mr-2"
              />
              No, I cannot attend
            </label>
          </div>
        </div>

        {formData.attending && (
          <div>
            <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of guests (including yourself) *
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
            Message (optional)
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="Share a memory or leave a message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>
    </div>
  )
}