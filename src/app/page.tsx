'use client'

import { useState } from 'react'
import RSVPForm from '@/components/RSVPForm'
import CarpoolForm from '@/components/CarpoolForm'
import PhotoAlbum from '@/components/PhotoAlbum'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'rsvp' | 'carpool' | 'photos'>('rsvp')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Memorial Service
            </h1>
            <p className="text-lg text-gray-600">
              Linnetsstígur 6, 220 Hafnarfjörður
            </p>
          </header>

          <div className="bg-white rounded-lg shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('rsvp')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'rsvp'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  RSVP
                </button>
                <button
                  onClick={() => setActiveTab('carpool')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'carpool'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Carpool
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'photos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Photos
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'rsvp' && <RSVPForm />}
              {activeTab === 'carpool' && <CarpoolForm />}
              {activeTab === 'photos' && <PhotoAlbum />}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}