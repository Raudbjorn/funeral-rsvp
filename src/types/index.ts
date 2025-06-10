export interface RSVP {
  id?: string
  name: string
  email?: string
  attending: boolean
  guestCount: number
  message?: string
  createdAt?: Date
}

export interface CarpoolDriver {
  id?: string
  name: string
  email?: string
  phone?: string
  departureLocation: string
  departureTime: string
  availableSeats: number
  route?: string
  createdAt?: Date
}

export interface CarpoolPassenger {
  id?: string
  name: string
  email?: string
  phone?: string
  pickupLocation: string
  driverId?: string
  createdAt?: Date
}

export interface Photo {
  id?: string
  filename: string
  originalName: string
  uploadedBy: string
  caption?: string
  createdAt?: Date
}