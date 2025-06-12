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