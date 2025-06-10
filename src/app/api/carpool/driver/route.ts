import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { CarpoolDriver } from '@/types'
import { carpoolLimiter, rateLimitCheck, detectSpam, getClientIP, isIcelandicIP, geographicLimiter } from '@/lib/rateLimiter'

const DATA_DIR = path.join(process.cwd(), 'data')
const DRIVERS_FILE = path.join(DATA_DIR, 'drivers.json')

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

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Rate limiting
    const rateLimitPassed = await rateLimitCheck(carpoolLimiter, clientIP)
    if (!rateLimitPassed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    
    // Geographic restrictions
    if (!isIcelandicIP(clientIP)) {
      const geoRateLimitPassed = await rateLimitCheck(geographicLimiter, clientIP)
      if (!geoRateLimitPassed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    }
    
    const driver: CarpoolDriver = await request.json()
    
    // Basic validation
    if (!driver.name || !driver.departureLocation || !driver.departureTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Spam detection
    if (detectSpam(driver.name) || detectSpam(driver.departureLocation)) {
      return NextResponse.json({ error: 'Content not allowed' }, { status: 400 })
    }
    
    // Additional validation
    if (driver.name.length > 100 || driver.departureLocation.length > 200) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    // Add timestamp and ID
    const newDriver: CarpoolDriver = {
      ...driver,
      id: Date.now().toString(),
      createdAt: new Date()
    }

    const drivers = await readDrivers()
    drivers.push(newDriver)
    await writeDrivers(drivers)

    return NextResponse.json({ success: true, id: newDriver.id })
  } catch (error) {
    console.error('Error processing driver registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}