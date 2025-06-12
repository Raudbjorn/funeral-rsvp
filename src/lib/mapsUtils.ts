// Google Maps utility functions

export interface DistanceInfo {
  distance: string
  duration: string
  distanceValue: number // in meters
  durationValue: number // in seconds
}

export interface LocationInfo {
  address: string
  lat: number
  lng: number
  placeId?: string
}

declare global {
  interface Window {
    google: any
  }
}

// Calculate distance and duration between two locations
export const calculateDistance = async (
  origin: string,
  destination: string
): Promise<DistanceInfo | null> => {
  return new Promise((resolve) => {
    if (!window.google) {
      resolve(null)
      return
    }

    const service = new window.google.maps.DistanceMatrixService()
    
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, (response: any, status: any) => {
      if (status === 'OK' && response.rows[0]?.elements[0]?.status === 'OK') {
        const element = response.rows[0].elements[0]
        resolve({
          distance: element.distance.text,
          duration: element.duration.text,
          distanceValue: element.distance.value,
          durationValue: element.duration.value
        })
      } else {
        resolve(null)
      }
    })
  })
}

// Geocode an address to get coordinates
export const geocodeAddress = async (address: string): Promise<LocationInfo | null> => {
  return new Promise((resolve) => {
    if (!window.google) {
      resolve(null)
      return
    }

    const geocoder = new window.google.maps.Geocoder()
    
    geocoder.geocode({ address, region: 'IS' }, (results: any[], status: any) => {
      if (status === 'OK' && results[0]) {
        const result = results[0]
        resolve({
          address: result.formatted_address,
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
          placeId: result.place_id
        })
      } else {
        resolve(null)
      }
    })
  })
}

// Format duration in a user-friendly way
export const formatDuration = (durationValue: number): string => {
  const minutes = Math.round(durationValue / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
  return `${minutes}m`
}

// Check if two locations are reasonably close for carpooling
export const isReasonableDistance = (distanceValue: number): boolean => {
  // Consider anything within 50km as reasonable for Iceland
  return distanceValue <= 50000 // 50km in meters
}

// Calculate all distances from passengers to drivers
export const calculateCarpoolMatches = async (
  passengers: Array<{ id: string; location: string; name: string }>,
  drivers: Array<{ id: string; departureLocation: string; name: string; availableSeats: number }>
): Promise<Array<{
  passengerId: string
  passengerName: string
  passengerLocation: string
  matches: Array<{
    driverId: string
    driverName: string
    driverLocation: string
    distance: DistanceInfo
    isReasonable: boolean
  }>
}>> => {
  const results = []

  for (const passenger of passengers) {
    const matches = []
    
    for (const driver of drivers) {
      const distance = await calculateDistance(passenger.location, driver.departureLocation)
      
      if (distance) {
        matches.push({
          driverId: driver.id,
          driverName: driver.name,
          driverLocation: driver.departureLocation,
          distance,
          isReasonable: isReasonableDistance(distance.distanceValue)
        })
      }
    }

    // Sort matches by distance (closest first)
    matches.sort((a, b) => a.distance.distanceValue - b.distance.distanceValue)

    results.push({
      passengerId: passenger.id,
      passengerName: passenger.name,
      passengerLocation: passenger.location,
      matches
    })
  }

  return results
}