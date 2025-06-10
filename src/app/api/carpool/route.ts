import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const drivers = await readDrivers()
    const passengers = await readPassengers()
    
    return NextResponse.json({
      drivers,
      passengers,
      stats: {
        totalDrivers: drivers.length,
        totalPassengers: passengers.length,
        totalSeats: drivers.reduce((sum, d) => sum + (d.availableSeats || 0), 0)
      }
    })
  } catch (error) {
    console.error('Error reading carpool data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}