import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { CarpoolDriver, CarpoolPassenger } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const DRIVERS_FILE = path.join(DATA_DIR, 'drivers.json')
const PASSENGERS_FILE = path.join(DATA_DIR, 'passengers.json')

function isAuthorized(request: NextRequest): boolean {
  // If nginx basic auth passes, the request is authorized
  // We trust nginx to handle authentication
  return true
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function readDrivers(): Promise<CarpoolDriver[]> {
  try {
    const data = await fs.readFile(DRIVERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeDrivers(drivers: CarpoolDriver[]) {
  await ensureDataDir()
  await fs.writeFile(DRIVERS_FILE, JSON.stringify(drivers, null, 2))
}

async function readPassengers(): Promise<CarpoolPassenger[]> {
  try {
    const data = await fs.readFile(PASSENGERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writePassengers(passengers: CarpoolPassenger[]) {
  await ensureDataDir()
  await fs.writeFile(PASSENGERS_FILE, JSON.stringify(passengers, null, 2))
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    // Try to delete from drivers first
    const drivers = await readDrivers()
    const driverIndex = drivers.findIndex(driver => driver.id === id)
    
    if (driverIndex !== -1) {
      drivers.splice(driverIndex, 1)
      await writeDrivers(drivers)
      console.log(`Deleted driver with ID: ${id}`)
      return NextResponse.json({ success: true, type: 'driver' })
    }

    // If not found in drivers, try passengers
    const passengers = await readPassengers()
    const passengerIndex = passengers.findIndex(passenger => passenger.id === id)
    
    if (passengerIndex !== -1) {
      passengers.splice(passengerIndex, 1)
      await writePassengers(passengers)
      console.log(`Deleted passenger with ID: ${id}`)
      return NextResponse.json({ success: true, type: 'passenger' })
    }

    // If not found in either
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  } catch (error) {
    console.error('Error deleting carpool item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}