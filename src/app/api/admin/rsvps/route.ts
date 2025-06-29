import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { RSVP } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const RSVP_FILE = path.join(DATA_DIR, 'rsvps.json')

// Check if request has basic auth (handled by nginx)
function isAuthorized(request: NextRequest): boolean {
  // If nginx basic auth passes, the request is authorized
  // We trust nginx to handle authentication
  return true
}

async function readRSVPs(): Promise<RSVP[]> {
  try {
    const data = await fs.readFile(RSVP_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeRSVPs(rsvps: RSVP[]) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(RSVP_FILE, JSON.stringify(rsvps, null, 2))
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const rsvps = await readRSVPs()
    return NextResponse.json({ rsvps })
  } catch (error) {
    console.error('Error reading RSVPs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}