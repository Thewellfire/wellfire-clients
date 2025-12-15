import axios from 'axios'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { backendUrl } from '../config/constants'
import { toast } from 'react-toastify'

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      setIsLoading(true)
      const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
      if (response.data.success) {
        setToken(response.data.token)
        toast.success('Login successful!')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent_50%)]'></div>
      
      <div className='relative w-full max-w-md'>
        {/* Login Card */}
        <div className='bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl px-10 py-12 border border-slate-200/60'>
          {/* Header */}
          <div className='text-center mb-10'>
            <div className='w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-gray-500/20'>
              <span className='text-white font-black text-3xl'>W</span>
            </div>
            <h1 className='text-3xl font-black text-gray-900 mb-2'>
              WELLFIRE
            </h1>
            <p className='text-lg font-semibold text-gray-600'>Admin Panel</p>
            <p className='text-sm text-gray-500 mt-2'>Sign in to manage your entertainment platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmitHandler} className='space-y-6'>
            {/* Email Field */}
            <div className='space-y-2'>
              <label className='text-base font-bold text-gray-700 block'>
                Email Address
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <svg className='h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' />
                  </svg>
                </div>
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email} 
                  className='w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50/50 focus:bg-white text-gray-700 placeholder-gray-400 font-medium shadow-inner focus:shadow-lg' 
                  type='email' 
                  placeholder='admin@wellfire.com' 
                  required 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <label className='text-base font-bold text-gray-700 block'>
                Password
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <svg className='h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                </div>
                <input 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  className='w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 bg-gray-50/50 focus:bg-white text-gray-700 placeholder-gray-400 font-medium shadow-inner focus:shadow-lg' 
                  type='password' 
                  placeholder='Enter your secure password' 
                  required 
                />
              </div>
            </div>

            {/* Login Button */}
            <button 
              className='w-full py-4 px-6 bg-black text-white font-bold text-lg rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3' 
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className='animate-spin h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' />
                  </svg>
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className='mt-8 text-center'>
            <p className='text-sm text-gray-500'>
              Secure admin access for WELLFIRE Entertainment
            </p>
            <div className='flex items-center justify-center gap-2 mt-3'>
              <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
              <span className='text-xs text-gray-400 font-medium'>System Online</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className='absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full blur-xl'></div>
        <div className='absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full blur-xl'></div>
      </div>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}

export default Login