// Rate limiting utility for authentication
class RateLimiter {
  constructor() {
    this.attempts = new Map();
    this.maxAttempts = 5;
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.blockDuration = 30 * 60 * 1000; // 30 minutes
  }

  // Check if user is rate limited
  isRateLimited(email) {
    const now = Date.now();
    const userAttempts = this.attempts.get(email);

    if (!userAttempts) {
      return false;
    }

    // Clean old attempts outside the window
    userAttempts.timestamps = userAttempts.timestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Check if user is blocked
    if (userAttempts.blockedUntil && now < userAttempts.blockedUntil) {
      return {
        limited: true,
        blocked: true,
        remainingTime: userAttempts.blockedUntil - now,
        reason: 'Account temporarily blocked due to too many failed attempts'
      };
    }

    // Check if user has exceeded max attempts
    if (userAttempts.timestamps.length >= this.maxAttempts) {
      // Block the user
      userAttempts.blockedUntil = now + this.blockDuration;
      this.attempts.set(email, userAttempts);
      
      return {
        limited: true,
        blocked: true,
        remainingTime: this.blockDuration,
        reason: 'Account temporarily blocked due to too many failed attempts'
      };
    }

    return false;
  }

  // Record a login attempt
  recordAttempt(email, success = false) {
    const now = Date.now();
    const userAttempts = this.attempts.get(email) || {
      timestamps: [],
      blockedUntil: null
    };

    if (success) {
      // Reset on successful login
      this.attempts.delete(email);
      return;
    }

    userAttempts.timestamps.push(now);
    this.attempts.set(email, userAttempts);
  }

  // Get remaining attempts
  getRemainingAttempts(email) {
    const userAttempts = this.attempts.get(email);
    if (!userAttempts) {
      return this.maxAttempts;
    }

    const now = Date.now();
    const validAttempts = userAttempts.timestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );

    return Math.max(0, this.maxAttempts - validAttempts.length);
  }

  // Clear attempts for a user (useful for testing)
  clearAttempts(email) {
    this.attempts.delete(email);
  }

  // Get formatted wait time
  formatWaitTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}

// Exponential backoff utility
export const exponentialBackoff = {
  // Calculate delay with exponential backoff
  calculateDelay(attempt, baseDelay = 1000, maxDelay = 30000) {
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    return delay + Math.random() * 1000; // Add jitter
  },

  // Wait for specified time
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Retry function with exponential backoff
  async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on rate limit errors
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          throw error;
        }

        if (attempt === maxAttempts - 1) {
          throw error;
        }

        const delay = this.calculateDelay(attempt, baseDelay);
        console.log(`Retry attempt ${attempt + 1}/${maxAttempts} in ${delay}ms`);
        await this.wait(delay);
      }
    }

    throw lastError;
  }
};

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Helper function to check and handle rate limiting
export const checkRateLimit = (email) => {
  const rateLimitResult = rateLimiter.isRateLimited(email);
  
  if (rateLimitResult) {
    const waitTime = rateLimiter.formatWaitTime(rateLimitResult.remainingTime);
    throw new Error(`Rate limit exceeded. Please wait ${waitTime} before trying again.`);
  }
  
  return rateLimiter.getRemainingAttempts(email);
};

// Helper function to record login attempt
export const recordLoginAttempt = (email, success = false) => {
  rateLimiter.recordAttempt(email, success);
}; 