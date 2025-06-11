'use client'

import { useState } from 'react'
import RSVPForm from '@/components/RSVPForm'
import CarpoolForm from '@/components/CarpoolForm'
import PhotoAlbum from '@/components/PhotoAlbum'
import CalendarButton from '@/components/CalendarButton'
import LanguageToggle from '@/components/LanguageToggle'
import { Language, useTranslation } from '@/lib/i18n'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'rsvp' | 'carpool' | 'photos'>('rsvp')
  const [language, setLanguage] = useState<Language>('en')
  const t = useTranslation(language)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Language toggle in top right */}
          <div className="flex justify-end mb-6">
            <LanguageToggle 
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
          
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t.memorialService}
            </h1>
            <div className="text-lg text-gray-600 mb-4">
              <p>Linnetsstígur 6, 220 Hafnarfjörður</p>
              <p className="text-xl font-semibold text-gray-800 mt-2">
                📅 13:00 / 1:00 PM
              </p>
            </div>
            <CalendarButton />
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
                  {t.rsvp}
                </button>
                <button
                  onClick={() => setActiveTab('carpool')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'carpool'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.carpool}
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'photos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.photos}
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'rsvp' && <RSVPForm language={language} />}
              {activeTab === 'carpool' && <CarpoolForm language={language} />}
              {activeTab === 'photos' && <PhotoAlbum language={language} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}