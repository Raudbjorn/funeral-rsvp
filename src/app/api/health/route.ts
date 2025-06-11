import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check - you could add database connectivity checks here
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Health check failed' },
      { status: 503 }
    )
  }
}