import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible'
import Redis from 'ioredis'

// Redis client setup with better error handling
let redis: Redis | null = null
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    })
    
    redis.on('error', (err) => {
      console.warn('Redis connection error, falling back to memory:', err.message)
      redis = null
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

// Different rate limiters for different endpoints
export const rsvpLimiter = createLimiter({
  keyPrefix: 'rsvp',
  points: 3, // Number of requests
  duration: 300, // Per 5 minutes
})

export const carpoolLimiter = createLimiter({
  keyPrefix: 'carpool',
  points: 5, // Number of requests
  duration: 300, // Per 5 minutes
})

export const photoLimiter = createLimiter({
  keyPrefix: 'photo',
  points: 10, // Number of uploads
  duration: 3600, // Per hour
})

export const generalLimiter = createLimiter({
  keyPrefix: 'general',
  points: 50, // Number of requests
  duration: 900, // Per 15 minutes
})

// Geographic rate limiting (stricter for non-Iceland IPs)
export const geographicLimiter = createLimiter({
  keyPrefix: 'geo',
  points: 1, // Very restrictive for non-Iceland
  duration: 3600, // Per hour
})

export async function rateLimitCheck(
  limiter: RateLimiterMemory | RateLimiterRedis,
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