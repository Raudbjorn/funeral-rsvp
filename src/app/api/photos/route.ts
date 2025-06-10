import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { Photo } from '@/types'
import { photoLimiter, rateLimitCheck, detectSpam, getClientIP, isIcelandicIP, geographicLimiter } from '@/lib/rateLimiter'

const DATA_DIR = path.join(process.cwd(), 'data')
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json')
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR)
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
  }
}

async function readPhotos(): Promise<Photo[]> {
  try {
    const data = await fs.readFile(PHOTOS_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writePhotos(photos: Photo[]) {
  await ensureDataDir()
  await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2))
}

export async function GET() {
  try {
    const photos = await readPhotos()
    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error reading photos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Rate limiting for photo uploads
    const rateLimitPassed = await rateLimitCheck(photoLimiter, clientIP)
    if (!rateLimitPassed) {
      return NextResponse.json({ error: 'Too many uploads' }, { status: 429 })
    }
    
    // Geographic restrictions
    if (!isIcelandicIP(clientIP)) {
      const geoRateLimitPassed = await rateLimitCheck(geographicLimiter, clientIP)
      if (!geoRateLimitPassed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    }
    
    const formData = await request.formData()
    const file = formData.get('photo') as File
    const uploadedBy = formData.get('uploadedBy') as string
    const caption = formData.get('caption') as string

    if (!file || !uploadedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Spam detection
    if (detectSpam(uploadedBy) || (caption && detectSpam(caption))) {
      return NextResponse.json({ error: 'Content not allowed' }, { status: 400 })
    }
    
    // Additional validation
    if (uploadedBy.length > 100 || (caption && caption.length > 200)) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large (max 5MB)' }, { status: 400 })
    }

    await ensureUploadsDir()

    // Generate unique filename
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const filename = `${timestamp}${extension}`
    const filePath = path.join(UPLOADS_DIR, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(bytes))

    // Save photo metadata
    const newPhoto: Photo = {
      id: timestamp.toString(),
      filename,
      originalName: file.name,
      uploadedBy,
      caption: caption || undefined,
      createdAt: new Date()
    }

    const photos = await readPhotos()
    photos.push(newPhoto)
    await writePhotos(photos)

    return NextResponse.json({ success: true, id: newPhoto.id })
  } catch (error) {
    console.error('Error processing photo upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}