// Signup Rate Limiting Utility
// Prevents "email rate limit exceeded" errors during account creation

const signupAttempts = new Map();
const SIGNUP_LIMIT = 3; // Maximum signup attempts per email
const SIGNUP_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes between retries

export const signupRateLimit = {
  // Check if signup is allowed for this email
  canSignup: (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    
    if (!signupAttempts.has(normalizedEmail)) {
      return { allowed: true, remainingAttempts: SIGNUP_LIMIT, resetTime: null };
    }
    
    const attempts = signupAttempts.get(normalizedEmail);
    const timeSinceFirstAttempt = now - attempts.firstAttempt;
    
    // Reset if window has passed
    if (timeSinceFirstAttempt > SIGNUP_WINDOW) {
      signupAttempts.delete(normalizedEmail);
      return { allowed: true, remainingAttempts: SIGNUP_LIMIT, resetTime: null };
    }
    
    const remainingAttempts = Math.max(0, SIGNUP_LIMIT - attempts.count);
    const resetTime = attempts.firstAttempt + SIGNUP_WINDOW;
    
    return {
      allowed: remainingAttempts > 0,
      remainingAttempts,
      resetTime,
      timeUntilReset: Math.max(0, resetTime - now)
    };
  },

  // Record a signup attempt
  recordAttempt: (email, success = false) => {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    
    if (!signupAttempts.has(normalizedEmail)) {
      signupAttempts.set(normalizedEmail, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        success: success
      });
    } else {
      const attempts = signupAttempts.get(normalizedEmail);
      attempts.count += 1;
      attempts.lastAttempt = now;
      attempts.success = success;
      
      // If successful, clear the attempts
      if (success) {
        signupAttempts.delete(normalizedEmail);
      }
    }
  },

  // Get remaining time until next attempt
  getTimeUntilNextAttempt: (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    
    if (!signupAttempts.has(normalizedEmail)) {
      return 0;
    }
    
    const attempts = signupAttempts.get(normalizedEmail);
    const timeSinceLastAttempt = now - attempts.lastAttempt;
    
    if (timeSinceLastAttempt < RETRY_DELAY) {
      return RETRY_DELAY - timeSinceLastAttempt;
    }
    
    return 0;
  },

  // Format time remaining in human readable format
  formatTimeRemaining: (milliseconds) => {
    if (milliseconds <= 0) return 'now';
    
    const minutes = Math.ceil(milliseconds / (60 * 1000));
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.ceil(milliseconds / (60 * 60 * 1000));
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  },

  // Clear all attempts (useful for testing)
  clearAll: () => {
    signupAttempts.clear();
  },

  // Get current status for debugging
  getStatus: (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    return signupAttempts.get(normalizedEmail) || null;
  }
};

// Exponential backoff for signup retries
export const signupBackoff = {
  retry: async (signupFunction, maxAttempts = 3, baseDelay = 2000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await signupFunction();
        return result;
      } catch (error) {
        lastError = error;
        
        // If it's a rate limit error, wait before retrying
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          if (attempt < maxAttempts) {
            const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`Signup rate limited, waiting ${delay}ms before retry ${attempt + 1}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // For other errors, don't retry
        throw error;
      }
    }
    
    throw lastError;
  }
}; 