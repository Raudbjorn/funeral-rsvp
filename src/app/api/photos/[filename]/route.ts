import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await params
    const filename = resolvedParams.filename
    const filePath = path.join(UPLOADS_DIR, filename)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read and serve the file
    const file = await fs.readFile(filePath)
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase()
    let contentType = 'image/jpeg'
    
    switch (ext) {
      case '.png':
        contentType = 'image/png'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.webp':
        contentType = 'image/webp'
        break
    }

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Error serving photo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}