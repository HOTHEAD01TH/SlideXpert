export function rateLimit({ interval, uniqueTokenPerInterval = 500 }: { interval: number, uniqueTokenPerInterval?: number }) {
  const tokens = new Map()
  
  return {
    check: async (limit: number) => {
      const now = Date.now()
      const clearBefore = now - interval
      
      // Clear old entries
      for (const [token, timestamp] of tokens.entries()) {
        if (timestamp < clearBefore) {
          tokens.delete(token)
        }
      } 
      
      // Check if limit is exceeded
      if (tokens.size >= limit) {
        throw new Error('Rate limit exceeded')
      }
      
      // Add new token
      const token = now.toString()
      tokens.set(token, now)
      
      return true
    }
  }
} 