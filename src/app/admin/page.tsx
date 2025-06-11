'use client'

import { useState, useEffect } from 'react'
import { RSVP, CarpoolDriver, CarpoolPassenger, Photo } from '@/types'

export default function AdminPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [drivers, setDrivers] = useState<CarpoolDriver[]>([])
  const [passengers, setPassengers] = useState<CarpoolPassenger[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is accessing via Tailscale
    const isTailscaleAccess = window.location.hostname.includes('ts.net') || 
                             window.location.hostname.includes('-admin')
    
    if (!isTailscaleAccess) {
      alert('Admin access is only available via Tailscale')
      window.location.href = '/'
      return
    }

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

  const deleteItem = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAllData() // Refresh data
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
              🔒 This admin panel is only accessible via Tailscale
            </div>
          </header>

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
        </div>
      </div>
    </div>
  )
}