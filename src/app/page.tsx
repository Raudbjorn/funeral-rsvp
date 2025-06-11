'use client'

import { useState } from 'react'
import RSVPForm from '@/components/RSVPForm'
import CarpoolForm from '@/components/CarpoolForm'
import PhotoAlbum from '@/components/PhotoAlbum'
import CalendarButton from '@/components/CalendarButton'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import SocialShare from '@/components/SocialShare'
import WeatherWidget from '@/components/WeatherWidget'
import { Language, useTranslation } from '@/lib/i18n'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'rsvp' | 'carpool' | 'photos'>('rsvp')
  const [language, setLanguage] = useState<Language>('en')
  const t = useTranslation(language)

  return (
    <main className="min-h-screen bg-gradient-sunset dark:bg-gradient-to-br dark:from-navy-900 dark:to-stone-900 transition-all duration-500">
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Controls in top right */}
          <div className="flex justify-end items-center space-x-2 mb-8 sm:space-x-3 sm:mb-12">
            <ThemeToggle />
            <LanguageToggle 
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
          
          {/* Decorative candle element */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Candle flame */}
              <div className="w-3 h-4 bg-gradient-to-t from-gold-400 via-gold-300 to-gold-200 rounded-full mx-auto mb-1 opacity-80 animate-pulse"></div>
              {/* Candle body */}
              <div className="w-2 h-12 bg-stone-100 dark:bg-stone-200 rounded-sm mx-auto shadow-sm"></div>
            </div>
          </div>
          
          <header className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-navy-800 dark:text-stone-100 mb-6 tracking-wide">
              {t.funeral}
            </h1>
            <div className="text-base sm:text-lg text-stone-600 dark:text-stone-300 mb-6 sm:mb-8 space-y-3 sm:space-y-4">
              <div>
                <a 
                  href="https://www.frikirkja.is/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-700 dark:text-lavender-300 hover:text-navy-800 dark:hover:text-lavender-200 font-medium transition-colors duration-200 text-lg sm:text-xl"
                >
                  {t.venue}
                </a>
                <p className="text-stone-500 dark:text-stone-400 mt-2">Linnetsstígur 6, 220 Hafnarfjörður</p>
              </div>
              <p className="text-lg sm:text-xl text-stone-700 dark:text-stone-300 font-light">
                June 16, 2025 • 13:00
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <CalendarButton />
              <SocialShare />
              <a
                href="https://www.frikirkja.is/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition-all duration-200 font-medium"
              >
                {t.venueWebsite}
              </a>
            </div>
          </header>

          {/* Weather Widget */}
          <div className="mb-6 sm:mb-8 max-w-md mx-auto">
            <WeatherWidget />
          </div>

          <div className="bg-stone-50/80 dark:bg-navy-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-stone-200/50 dark:border-navy-700/50">
            <div className="border-b border-stone-200/60 dark:border-navy-700/60">
              <nav className="flex space-x-4 sm:space-x-8 lg:space-x-12 px-4 sm:px-8 justify-center overflow-x-auto"
                <button
                  onClick={() => setActiveTab('rsvp')}
                  className={`py-4 sm:py-6 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'rsvp'
                      ? 'border-navy-600 text-navy-700 dark:border-lavender-400 dark:text-lavender-300'
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                >
                  {t.rsvp}
                </button>
                <button
                  onClick={() => setActiveTab('carpool')}
                  className={`py-4 sm:py-6 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'carpool'
                      ? 'border-navy-600 text-navy-700 dark:border-lavender-400 dark:text-lavender-300'
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                >
                  {t.carpool}
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`py-4 sm:py-6 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'photos'
                      ? 'border-navy-600 text-navy-700 dark:border-lavender-400 dark:text-lavender-300'
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                >
                  {t.photos}
                </button>
              </nav>
            </div>

            <div className="p-6 sm:p-8 lg:p-12">
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