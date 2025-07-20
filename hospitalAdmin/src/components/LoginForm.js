import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, Building2 } from 'lucide-react'
import { checkRateLimit, recordLoginAttempt, exponentialBackoff } from '../utils/rateLimit'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    // Check rate limiting
    try {
      const remainingAttempts = checkRateLimit(email.trim())
      console.log(`Remaining login attempts: ${remainingAttempts}`)
    } catch (rateLimitError) {
      toast.error(rateLimitError.message)
      return
    }
    
    setLoading(true)
    console.log('Login attempt with:', email)
    
    try {
      // Use exponential backoff for login attempts
      const result = await exponentialBackoff.retry(
        async () => {
          const signInResult = await signIn(email, password)
          return signInResult
        },
        3, // max attempts
        2000 // base delay
      )
      
      console.log('Sign in result:', result)
      
      if (result.success) {
        recordLoginAttempt(email.trim(), true)
        toast.success('Login successful!')
        navigate('/dashboard')
      } else {
        console.error('Login failed:', result.error)
        
        // Handle rate limit specifically
        if (result.error && (result.error.includes('rate limit') || result.error.includes('too many requests'))) {
          recordLoginAttempt(email.trim(), false)
          toast.error('Rate limit exceeded. Please wait a few minutes before trying again.')
        } else {
          recordLoginAttempt(email.trim(), false)
          toast.error(result.error || 'Login failed')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.message && (error.message.includes('rate limit') || error.message.includes('too many requests'))) {
        recordLoginAttempt(email.trim(), false)
        toast.error('Rate limit exceeded. Please wait a few minutes before trying again.')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  // Test function to check Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      console.log('Supabase connection test:', { data, error })
      if (error) {
        toast.error('Supabase connection failed: ' + error.message)
      } else {
        toast.success('Supabase connection successful')
      }
    } catch (error) {
      console.error('Connection test error:', error)
      toast.error('Connection test failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Blue background with logo */}
      <div className="bg-blue-500 px-10 py-16 text-center">
        <div className="mx-auto w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-5">
          <Building2 className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Wopital
        </h1>
        <p className="text-lg text-white text-opacity-80">
          Your Digital Hospital Book
        </p>
      </div>

      {/* Form Section - White container with rounded top */}
      <div className="bg-white -mt-5 rounded-t-3xl px-8 py-8 min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to access your health records
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center">
              <Mail className="h-5 w-5 text-gray-500 mr-3" />
              <input
                type="email"
                required
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center relative">
              <Lock className="h-5 w-5 text-gray-500 mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none pr-12"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-blue-500 text-sm hover:text-blue-600"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-4 px-4 rounded-xl font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Rate Limit Info */}
            {(() => {
              try {
                const remainingAttempts = checkRateLimit(email.trim())
                if (remainingAttempts < 5) {
                  return (
                    <div className="text-center mt-2">
                      <p className="text-sm text-red-500">
                        {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                      </p>
                    </div>
                  )
                }
              } catch (error) {
                // Rate limited, don't show attempts
              }
              return null
            })()}
          </form>

          {/* Test Connection Button (for debugging) */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={testConnection}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Test Connection
            </button>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-500 font-semibold hover:text-blue-600"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Hospital Image */}
          <div className="mt-8 text-center">
            <img 
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="Hospital"
              className="w-48 h-28 object-cover rounded-xl shadow-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm 