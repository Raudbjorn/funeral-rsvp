import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { RSVP } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const RSVP_FILE = path.join(DATA_DIR, 'rsvps.json')

function isTailscaleRequest(request: NextRequest): boolean {
  const host = request.headers.get('host') || ''
  const forwarded = request.headers.get('x-forwarded-host') || ''
  
  return host.includes('-admin') || 
         host.includes('.ts.net') || 
         forwarded.includes('-admin') ||
         forwarded.includes('.ts.net')
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isTailscaleRequest(request)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const resolvedParams = await params
    const rsvps = await readRSVPs()
    const filteredRsvps = rsvps.filter(r => r.id !== resolvedParams.id)
    
    if (filteredRsvps.length === rsvps.length) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 })
    }
    
    await writeRSVPs(filteredRsvps)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}