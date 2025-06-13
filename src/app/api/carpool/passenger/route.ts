import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { CarpoolPassenger } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const PASSENGERS_FILE = path.join(DATA_DIR, 'passengers.json')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
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

async function writePassengers(passengers: CarpoolPassenger[]) {
  await ensureDataDir()
  await fs.writeFile(PASSENGERS_FILE, JSON.stringify(passengers, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const passenger: CarpoolPassenger = await request.json()
    
    // Basic validation
    if (!passenger.name || !passenger.pickupLocation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Additional validation
    if (passenger.name.length > 100 || passenger.pickupLocation.length > 200) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    // Add timestamp and ID
    const newPassenger: CarpoolPassenger = {
      ...passenger,
      id: Date.now().toString(),
      createdAt: new Date()
    }

    const passengers = await readPassengers()
    passengers.push(newPassenger)
    await writePassengers(passengers)

    return NextResponse.json({ success: true, id: newPassenger.id })
  } catch (error) {
    console.error('Error processing passenger registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}