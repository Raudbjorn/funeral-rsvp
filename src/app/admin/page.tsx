'use client'

import { useState, useEffect, useCallback } from 'react'
import { RSVP, CarpoolDriver, CarpoolPassenger, Photo } from '@/types'
import { calculateCarpoolMatches, DistanceInfo } from '@/lib/mapsUtils'

export default function AdminPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [drivers, setDrivers] = useState<CarpoolDriver[]>([])
  const [passengers, setPassengers] = useState<CarpoolPassenger[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [carpoolMatches, setCarpoolMatches] = useState<any[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'rsvps' | 'carpool' | 'photos'>('overview')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [rsvpRes, carpoolRes, photosRes] = await Promise.all([
        fetch('/api/admin/rsvps'),
        fetch('/api/admin/carpool'),
        fetch('/api/admin/photos')
      ])

      if (rsvpRes.ok) {
        const rsvpData = await rsvpRes.json()
        setRsvps(rsvpData.rsvps || [])
      }

      if (carpoolRes.ok) {
        const carpoolData = await carpoolRes.json()
        setDrivers(carpoolData.drivers || [])
        setPassengers(carpoolData.passengers || [])
      }

      if (photosRes.ok) {
        const photosData = await photosRes.json()
        setPhotos(photosData.photos || [])
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMatches = useCallback(async () => {
    if (passengers.length === 0 || drivers.length === 0) return
    
    // Check if Google Maps API is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'your-google-maps-api-key') {
      console.warn('Google Maps API key not configured, skipping carpool matching')
      setCarpoolMatches([])
      return
    }
    
    setLoadingMatches(true)
    try {
      const passengersData = passengers.map(p => ({
        id: p.id!,
        location: p.pickupLocation,
        name: p.name
      }))
      
      const driversData = drivers.map(d => ({
        id: d.id!,
        departureLocation: d.departureLocation,
        name: d.name,
        availableSeats: d.availableSeats
      }))
      
      const matches = await calculateCarpoolMatches(passengersData, driversData)
      setCarpoolMatches(matches)
    } catch (error) {
      console.error('Error calculating matches:', error)
      // Set empty matches on error to prevent infinite loop
      setCarpoolMatches([])
    } finally {
      setLoadingMatches(false)
    }
  }, [passengers, drivers])

  // Calculate matches when carpool data is loaded
  useEffect(() => {
    if (drivers.length > 0 && passengers.length > 0) {
      calculateMatches()
    }
  }, [drivers, passengers, calculateMatches])

  const deleteItem = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      let url: string
      
      if (type === 'drivers' || type === 'passengers') {
        // For carpool items, use the carpool endpoint with query params
        const carpoolType = type === 'drivers' ? 'driver' : 'passenger'
        url = `/api/admin/carpool?id=${id}&type=${carpoolType}`
      } else {
        // For other items, use the standard endpoint
        url = `/api/admin/${type}/${id}`
      }

      const response = await fetch(url, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAllData() // Refresh data
      } else {
        console.error('Delete failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading admin panel...</div>
      </div>
    )
  }

  const attendingRsvps = rsvps.filter(r => r.attending)
  const totalGuests = attendingRsvps.reduce((sum, r) => sum + (r.guestCount || 1), 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              🔒 This admin panel is protected by basic authentication
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'carpool', name: 'Carpool Matching', icon: '🚗' },
                { id: 'rsvps', name: 'RSVPs', icon: '✉️' },
                { id: 'photos', name: 'Photos', icon: '📸' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'overview' && (
            <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total RSVPs</h3>
              <p className="text-3xl font-bold text-blue-600">{rsvps.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Attending</h3>
              <p className="text-3xl font-bold text-green-600">{attendingRsvps.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Guests</h3>
              <p className="text-3xl font-bold text-purple-600">{totalGuests}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
              <p className="text-3xl font-bold text-yellow-600">{photos.length}</p>
            </div>
          </div>

          {/* RSVPs */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">RSVPs ({rsvps.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rsvps.map(rsvp => (
                    <tr key={rsvp.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rsvp.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rsvp.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rsvp.attending ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rsvp.attending ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rsvp.attending ? rsvp.guestCount || 1 : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {rsvp.message || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteItem('rsvps', rsvp.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drivers */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Drivers ({drivers.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {drivers.map(driver => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {driver.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.departureLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.departureTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.availableSeats}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteItem('drivers', driver.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Photos ({photos.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
              {photos.map(photo => (
                <div key={photo.id} className="border rounded-lg overflow-hidden">
                  <img
                    src={`/api/photos/${photo.filename}`}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-sm font-medium">{photo.uploadedBy}</p>
                    {photo.caption && (
                      <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>
                    )}
                    <button
                      onClick={() => deleteItem('photos', photo.id!)}
                      className="mt-2 text-red-600 hover:text-red-900 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}

          {activeTab === 'carpool' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Carpool Matching</h2>
                    <button
                      onClick={calculateMatches}
                      disabled={loadingMatches}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loadingMatches ? 'Calculating...' : 'Recalculate Matches'}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {carpoolMatches.length > 0 ? (
                    <div className="space-y-6">
                      {carpoolMatches.map((passenger) => (
                        <div key={passenger.passengerId} className="border border-gray-200 rounded-lg p-4">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {passenger.passengerName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Pickup from: {passenger.passengerLocation}
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Potential Drivers:</h4>
                            {passenger.matches.length > 0 ? (
                              passenger.matches.map((match: any) => (
                                <div
                                  key={match.driverId}
                                  className={`p-3 rounded border ${
                                    match.isReasonable
                                      ? 'border-green-200 bg-green-50'
                                      : 'border-yellow-200 bg-yellow-50'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{match.driverName}</p>
                                      <p className="text-sm text-gray-600">
                                        From: {match.driverLocation}
                                      </p>
                                      <p className="text-sm">
                                        📍 {match.distance.distance} • ⏱️ {match.distance.duration}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full ${
                                          match.isReasonable
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                      >
                                        {match.isReasonable ? 'Good Match' : 'Far Apart'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 italic">No drivers found</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {loadingMatches ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          <span className="ml-2">Calculating matches...</span>
                        </div>
                      ) : (
                        'No carpool data available or matches calculated yet'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rsvps' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">RSVPs ({rsvps.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rsvps.map(rsvp => (
                      <tr key={rsvp.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rsvp.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rsvp.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rsvp.attending ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {rsvp.attending ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rsvp.attending ? rsvp.guestCount || 1 : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {rsvp.message || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteItem('rsvps', rsvp.id!)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Photos ({photos.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                {photos.map(photo => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden">
                    <img
                      src={`/api/photos/${photo.filename}`}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium">{photo.uploadedBy}</p>
                      {photo.caption && (
                        <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>
                      )}
                      <button
                        onClick={() => deleteItem('photos', photo.id!)}
                        className="mt-2 text-red-600 hover:text-red-900 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}