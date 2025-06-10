import { RateLimiterMemory } from 'rate-limiter-flexible'

// Different rate limiters for different endpoints
export const rsvpLimiter = new RateLimiterMemory({
  points: 3, // Number of requests
  duration: 300, // Per 5 minutes
})

export const carpoolLimiter = new RateLimiterMemory({
  points: 5, // Number of requests
  duration: 300, // Per 5 minutes
})

export const photoLimiter = new RateLimiterMemory({
  points: 10, // Number of uploads
  duration: 3600, // Per hour
})

export const generalLimiter = new RateLimiterMemory({
  points: 50, // Number of requests
  duration: 900, // Per 15 minutes
})

// Geographic rate limiting (stricter for non-Iceland IPs)
export const geographicLimiter = new RateLimiterMemory({
  points: 1, // Very restrictive for non-Iceland
  duration: 3600, // Per hour
})

export async function rateLimitCheck(
  limiter: RateLimiterMemory,
  key: string
): Promise<boolean> {
  try {
    await limiter.consume(key)
    return true
  } catch {
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