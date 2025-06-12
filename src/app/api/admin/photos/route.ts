import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { Photo } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json')

function isAuthorized(request: NextRequest): boolean {
  // If nginx basic auth passes, the request is authorized
  // We trust nginx to handle authentication
  return true
}

async function readPhotos(): Promise<Photo[]> {
  try {
    const data = await fs.readFile(PHOTOS_FILE, 'utf8')
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
    const photos = await readPhotos()
    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error reading photos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}