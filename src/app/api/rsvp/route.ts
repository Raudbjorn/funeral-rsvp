import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { RSVP } from '@/types'
import { rsvpLimiter, rateLimitCheck, detectSpam, getClientIP, isIcelandicIP, geographicLimiter } from '@/lib/rateLimiter'

const DATA_DIR = path.join(process.cwd(), 'data')
const RSVP_FILE = path.join(DATA_DIR, 'rsvps.json')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
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
  await ensureDataDir()
  await fs.writeFile(RSVP_FILE, JSON.stringify(rsvps, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    console.log('RSVP submission from IP:', clientIP)
    
    // Rate limiting with error handling
    try {
      const rateLimitPassed = await rateLimitCheck(rsvpLimiter, clientIP)
      if (!rateLimitPassed) {
        console.log('Rate limit exceeded for IP:', clientIP)
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
    } catch (rateLimitError) {
      console.warn('Rate limit check failed, allowing request:', rateLimitError)
    }
    
    // Geographic restrictions (stricter for non-Iceland IPs)
    try {
      if (!isIcelandicIP(clientIP)) {
        const geoRateLimitPassed = await rateLimitCheck(geographicLimiter, clientIP)
        if (!geoRateLimitPassed) {
          console.log('Geographic rate limit exceeded for IP:', clientIP)
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }
      }
    } catch (geoRateLimitError) {
      console.warn('Geographic rate limit check failed, allowing request:', geoRateLimitError)
    }
    
    const rsvp: RSVP = await request.json()
    
    // Basic validation
    if (!rsvp.name || typeof rsvp.attending !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    
    // Spam detection
    if (detectSpam(rsvp.name) || (rsvp.message && detectSpam(rsvp.message))) {
      return NextResponse.json({ error: 'Content not allowed' }, { status: 400 })
    }
    
    // Additional validation
    if (rsvp.name.length > 100 || (rsvp.message && rsvp.message.length > 500)) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    // Add timestamp and ID
    const newRSVP: RSVP = {
      ...rsvp,
      id: Date.now().toString(),
      createdAt: new Date()
    }

    const rsvps = await readRSVPs()
    rsvps.push(newRSVP)
    await writeRSVPs(rsvps)

    return NextResponse.json({ success: true, id: newRSVP.id })
  } catch (error) {
    console.error('Error processing RSVP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rsvps = await readRSVPs()
    
    // Return summary statistics
    const attending = rsvps.filter(r => r.attending)
    const notAttending = rsvps.filter(r => !r.attending)
    const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0)
    
    return NextResponse.json({
      total: rsvps.length,
      attending: attending.length,
      notAttending: notAttending.length,
      totalGuests
    })
  } catch (error) {
    console.error('Error reading RSVPs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}