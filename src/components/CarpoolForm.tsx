'use client'

import { useState, useEffect } from 'react'
import { CarpoolDriver, CarpoolPassenger } from '@/types'
import { Language, useTranslation } from '@/lib/i18n'
import RouteMap from './RouteMap'

interface CarpoolFormProps {
  language: Language
}

export default function CarpoolForm({ language }: CarpoolFormProps) {
  const t = useTranslation(language)
  const [mode, setMode] = useState<'driver' | 'passenger'>('driver')
  const [drivers, setDrivers] = useState<CarpoolDriver[]>([])
  const [passengers, setPassengers] = useState<CarpoolPassenger[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null)

  // Destination address
  const DESTINATION = "Linnetsstígur 6, 220 Hafnarfjörður"
  // You would replace this with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"

  const [driverForm, setDriverForm] = useState<Partial<CarpoolDriver>>({
    name: '',
    email: '',
    phone: '',
    departureLocation: '',
    departureTime: '',
    availableSeats: 3
  })

  const [passengerForm, setPassengerForm] = useState<Partial<CarpoolPassenger>>({
    name: '',
    email: '',
    phone: '',
    pickupLocation: '',
    driverId: ''
  })

  useEffect(() => {
    fetchCarpoolData()
  }, [])

  const fetchCarpoolData = async () => {
    try {
      const response = await fetch('/api/carpool')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data.drivers || [])
        setPassengers(data.passengers || [])
      }
    } catch (error) {
      console.error('Error fetching carpool data:', error)
    }
  }

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/carpool/driver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverForm)
      })

      if (response.ok) {
        setSubmitted(true)
        setDriverForm({
          name: '',
          email: '',
          phone: '',
          departureLocation: '',
          departureTime: '',
          availableSeats: 3
        })
        fetchCarpoolData()
      }
    } catch (error) {
      console.error('Error submitting driver info:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePassengerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/carpool/passenger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passengerForm)
      })

      if (response.ok) {
        setSubmitted(true)
        setPassengerForm({
          name: '',
          email: '',
          phone: '',
          pickupLocation: '',
          driverId: ''
        })
        fetchCarpoolData()
      }
    } catch (error) {
      console.error('Error submitting passenger info:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-xl font-semibold mb-4">
          Thank you!
        </div>
        <p className="text-gray-600 mb-4">
          Your carpool information has been recorded.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-blue-600 underline"
        >
          Add another entry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Carpool Coordination</h2>
      
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setMode('driver')}
            className={`px-4 py-2 rounded-md ${
              mode === 'driver'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            I can drive
          </button>
          <button
            onClick={() => setMode('passenger')}
            className={`px-4 py-2 rounded-md ${
              mode === 'passenger'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            I need a ride
          </button>
        </div>
      </div>

      {mode === 'driver' ? (
        <form onSubmit={handleDriverSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="driver-name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="driver-name"
                required
                value={driverForm.name}
                onChange={(e) => setDriverForm({...driverForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="driver-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                id="driver-email"
                value={driverForm.email}
                onChange={(e) => setDriverForm({...driverForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="driver-phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="driver-phone"
              value={driverForm.phone}
              onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="departure-location" className="block text-sm font-medium text-gray-700 mb-2">
              Departure Location *
            </label>
            <input
              type="text"
              id="departure-location"
              required
              value={driverForm.departureLocation}
              onChange={(e) => setDriverForm({...driverForm, departureLocation: e.target.value})}
              placeholder="e.g., Reykjavik downtown, Kópavogur, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departure-time" className="block text-sm font-medium text-gray-700 mb-2">
                Departure Time *
              </label>
              <input
                type="text"
                id="departure-time"
                required
                value={driverForm.departureTime}
                onChange={(e) => setDriverForm({...driverForm, departureTime: e.target.value})}
                placeholder="e.g., 2:00 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="available-seats" className="block text-sm font-medium text-gray-700 mb-2">
                Available Seats *
              </label>
              <select
                id="available-seats"
                value={driverForm.availableSeats}
                onChange={(e) => setDriverForm({...driverForm, availableSeats: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6,7].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Register as Driver'}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePassengerSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="passenger-name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="passenger-name"
                required
                value={passengerForm.name}
                onChange={(e) => setPassengerForm({...passengerForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="passenger-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                id="passenger-email"
                value={passengerForm.email}
                onChange={(e) => setPassengerForm({...passengerForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="passenger-phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="passenger-phone"
              value={passengerForm.phone}
              onChange={(e) => setPassengerForm({...passengerForm, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="pickup-location" className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location *
            </label>
            <input
              type="text"
              id="pickup-location"
              required
              value={passengerForm.pickupLocation}
              onChange={(e) => setPassengerForm({...passengerForm, pickupLocation: e.target.value})}
              placeholder="e.g., Reykjavik downtown, Kópavogur, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="preferred-driver" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Driver (optional)
            </label>
            <select
              id="preferred-driver"
              value={passengerForm.driverId}
              onChange={(e) => setPassengerForm({...passengerForm, driverId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any available driver</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - from {driver.departureLocation} at {driver.departureTime}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Request Ride'}
          </button>
        </form>
      )}

      {drivers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Available Drivers</h3>
          <div className="space-y-4">
            {drivers.map(driver => (
              <div key={driver.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{driver.name}</div>
                    <div className="text-sm text-gray-600">
                      From: {driver.departureLocation} • Time: {driver.departureTime} • Seats: {driver.availableSeats}
                    </div>
                    {driver.phone && (
                      <div className="text-sm text-gray-600">Phone: {driver.phone}</div>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedDriver(expandedDriver === driver.id ? null : driver.id!)}
                    className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {expandedDriver === driver.id ? 'Hide Route' : 'View Route'}
                  </button>
                </div>
                
                {expandedDriver === driver.id && driver.departureLocation && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Route from {driver.departureLocation} to {DESTINATION}
                    </div>
                    {GOOGLE_MAPS_API_KEY !== "YOUR_API_KEY_HERE" ? (
                      <RouteMap 
                        origin={driver.departureLocation}
                        destination={DESTINATION}
                        apiKey={GOOGLE_MAPS_API_KEY}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Google Maps API key needed to display route</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}