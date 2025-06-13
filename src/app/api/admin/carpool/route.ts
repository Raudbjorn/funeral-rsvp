import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { CarpoolDriver, CarpoolPassenger } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const DRIVERS_FILE = path.join(DATA_DIR, 'drivers.json')
const PASSENGERS_FILE = path.join(DATA_DIR, 'passengers.json')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

function isAuthorized(request: NextRequest): boolean {
  // If nginx basic auth passes, the request is authorized
  // We trust nginx to handle authentication
  return true
}

async function readDrivers(): Promise<CarpoolDriver[]> {
  try {
    const data = await fs.readFile(DRIVERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function readPassengers(): Promise<CarpoolPassenger[]> {
  try {
    const data = await fs.readFile(PASSENGERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const [drivers, passengers] = await Promise.all([
      readDrivers(),
      readPassengers()
    ])
    
    return NextResponse.json({ drivers, passengers })
  } catch (error) {
    console.error('Error reading carpool data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') // 'driver' or 'passenger'

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type parameter' }, { status: 400 })
    }

    if (type === 'driver') {
      const drivers = await readDrivers()
      const updatedDrivers = drivers.filter(driver => driver.id !== id)
      await ensureDataDir()
      await fs.writeFile(DRIVERS_FILE, JSON.stringify(updatedDrivers, null, 2))
    } else if (type === 'passenger') {
      const passengers = await readPassengers()
      const updatedPassengers = passengers.filter(passenger => passenger.id !== id)
      await ensureDataDir()
      await fs.writeFile(PASSENGERS_FILE, JSON.stringify(updatedPassengers, null, 2))
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting carpool entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}