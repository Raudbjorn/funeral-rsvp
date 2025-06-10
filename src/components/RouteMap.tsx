'use client'

import { useEffect, useRef } from 'react'

interface RouteMapProps {
  origin: string
  destination: string
  apiKey: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function RouteMap({ origin, destination, apiKey }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap()
        return
      }

      window.initMap = initializeMap
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=geometry,places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 64.1466, lng: -21.9426 }, // Reykjavik center
        mapTypeControl: false,
        streetViewControl: false,
      })

      mapInstance.current = map

      const directionsService = new window.google.maps.DirectionsService()
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4F46E5',
          strokeWeight: 4,
        }
      })

      directionsRenderer.setMap(map)

      // Calculate and display route
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result)
          } else {
            console.error('Directions request failed due to ' + status)
          }
        }
      )
    }

    loadGoogleMaps()

    return () => {
      // Cleanup
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
      scripts.forEach(script => script.remove())
    }
  }, [origin, destination, apiKey])

  return (
    <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}