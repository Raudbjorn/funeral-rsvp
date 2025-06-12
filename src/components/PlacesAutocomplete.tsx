'use client'

import { useEffect, useRef, useState } from 'react'

interface PlacesAutocompleteProps {
  value: string
  onChange: (value: string, placeDetails?: any) => void
  placeholder?: string
  className?: string
  required?: boolean
  apiKey: string
}

declare global {
  interface Window {
    google: any
  }
}

export default function PlacesAutocomplete({
  value,
  onChange,
  placeholder = "Search for location...",
  className = "",
  required = false,
  apiKey
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google || !inputRef.current) return

      // Create autocomplete instance with Iceland bias
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'is' }, // Restrict to Iceland
          fields: ['place_id', 'formatted_address', 'name', 'geometry', 'types']
        }
      )

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (place && place.formatted_address) {
          onChange(place.formatted_address, place)
        }
      })

      setIsLoaded(true)
    }

    const loadGoogleMaps = () => {
      if (window.google) {
        initializeAutocomplete()
        return
      }

      // Check if script is already loading/loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.addEventListener('load', initializeAutocomplete)
        return
      }

      // Load Google Maps script with Places library
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
      script.async = true
      script.defer = true
      
      // Create global callback
      ;(window as any).initGoogleMaps = initializeAutocomplete
      
      document.head.appendChild(script)
    }

    loadGoogleMaps()

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [apiKey, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}