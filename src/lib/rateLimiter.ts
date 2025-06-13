import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible'
import Redis from 'ioredis'

// Redis client setup with better error handling
let redis: Redis | null = null
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL)
    
    redis.on('error', (err) => {
      console.warn('Redis connection error, falling back to memory:', err.message)
      redis = null
    })
    
    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }
} catch (error) {
  console.warn('Failed to initialize Redis, using memory rate limiter:', error)
  redis = null
}

// Use Redis if available, otherwise fallback to memory
const createLimiter = (options: any) => {
  if (redis) {
    try {
      return new RateLimiterRedis({
        storeClient: redis,
        ...options
      })
    } catch (error) {
      console.warn('Failed to create Redis rate limiter, falling back to memory:', error)
    }
  }
  return new RateLimiterMemory(options)
}

// Lazy rate limiter creation to avoid build-time errors
let _rsvpLimiter: any = null
let _carpoolLimiter: any = null
let _photoLimiter: any = null
let _generalLimiter: any = null
let _geographicLimiter: any = null

export const rsvpLimiter = {
  consume: async (key: string) => {
    if (!_rsvpLimiter) {
      _rsvpLimiter = createLimiter({
        keyPrefix: 'rsvp',
        points: 3, // Number of requests
        duration: 300, // Per 5 minutes
      })
    }
    return _rsvpLimiter.consume(key)
  }
}

export const carpoolLimiter = {
  consume: async (key: string) => {
    if (!_carpoolLimiter) {
      _carpoolLimiter = createLimiter({
        keyPrefix: 'carpool',
        points: 5, // Number of requests
        duration: 300, // Per 5 minutes
      })
    }
    return _carpoolLimiter.consume(key)
  }
}

export const photoLimiter = {
  consume: async (key: string) => {
    if (!_photoLimiter) {
      _photoLimiter = createLimiter({
        keyPrefix: 'photo',
        points: 10, // Number of uploads
        duration: 3600, // Per hour
      })
    }
    return _photoLimiter.consume(key)
  }
}

export const generalLimiter = {
  consume: async (key: string) => {
    if (!_generalLimiter) {
      _generalLimiter = createLimiter({
        keyPrefix: 'general',
        points: 50, // Number of requests
        duration: 900, // Per 15 minutes
      })
    }
    return _generalLimiter.consume(key)
  }
}

// Geographic rate limiting (stricter for non-Iceland IPs)
export const geographicLimiter = {
  consume: async (key: string) => {
    if (!_geographicLimiter) {
      _geographicLimiter = createLimiter({
        keyPrefix: 'geo',
        points: 1, // Very restrictive for non-Iceland
        duration: 3600, // Per hour
      })
    }
    return _geographicLimiter.consume(key)
  }
}

export async function rateLimitCheck(
  limiter: { consume: (key: string) => Promise<any> },
  key: string
): Promise<boolean> {
  try {
    await limiter.consume(key)
    return true
  } catch (error) {
    // Log rate limit hits for debugging
    console.log(`Rate limit hit for key: ${key}`)
    return false
  }
}

// Simple spam detection
export function detectSpam(text: string): boolean {
  if (!text) return false
  
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner|congratulations|free money|click here|act now)\b/i,
    /\b(www\.|http|\.com|\.net|\.org)\b/g,
    /(.)\1{4,}/, // Repeated characters
    /[A-Z]{10,}/, // Too many caps
  ]
  
  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return true
    }
  }
  
  // Check for excessive length
  if (text.length > 500) {
    return true
  }
  
  return false
}

// Get client IP from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Check if IP is from Iceland (very basic check)
export function isIcelandicIP(ip: string): boolean {
  // This is a very basic check - in production you'd use a proper IP geolocation service
  // For now, we'll be permissive and only block obvious non-Iceland patterns
  
  // Block some common non-Iceland IP ranges (this is not comprehensive)
  const blockedRanges = [
    /^192\.168\./, // Private network
    /^10\./, // Private network
    /^172\.(1[6-9]|2\d|3[01])\./, // Private network
    /^127\./, // Localhost
  ]
  
  // Allow private networks and localhost for development
  for (const range of blockedRanges) {
    if (range.test(ip)) {
      return true // Allow for development
    }
  }
  
  // For production, you would integrate with a real IP geolocation service
  // For now, we'll be permissive
  return true
}