import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logo from '../assets/Group 3.png'

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className={`shadow-lg ${isAuthenticated ? 'bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center content-center h-16">
          <div className="flex items-center">
            <img src={logo} className='w-10 mt-1' alt="" />
            <Link to="/" className={`text-2xl font-bold ${isAuthenticated ? 'text-white' : 'text-gray-800'}`}>
              FridgeFriend
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/community" className="text-white hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium">
                  Community
                </Link>
                <Link to="/donation" className="text-white hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium">
                  Donation Drive
                </Link>
                <Link to="/kitchen" className="text-white hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium">
                  Virtual Kitchen
                </Link>
                <Link to="/recipe" className="text-white hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium">
                  Recipe
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-emerald-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-emerald-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-white hover:text-emerald-200 px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/community"
                  className="block text-white hover:text-emerald-200 px-3 py-2 rounded-md text-base font-medium"
                >
                  Community
                </Link>
                <Link
                  to="/donation"
                  className="block text-white hover:text-emerald-200 px-3 py-2 rounded-md text-base font-medium"
                >
                  Donation Drive
                </Link>
                <Link
                  to="/kitchen"
                  className="block text-white hover:text-emerald-200 px-3 py-2 rounded-md text-base font-medium"
                >
                  Virtual Kitchen
                </Link>
                <Link
                  to="/recipe"
                  className="block text-white hover:text-emerald-200 px-3 py-2 rounded-md text-base font-medium"
                >
                  Recipe
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-white hover:text-emerald-200 px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className='h-1 mt-1 blur-sm bg-lime-300'></div>
    </nav>
  )
}

export default Navbar