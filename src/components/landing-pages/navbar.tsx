"use client"

import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { authService } from '@/lib/auth'
import { Menu, X } from 'lucide-react'
import { Button } from '../ui/button'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLogIn = await authService.isLoggedIn()
      setIsLoggedIn(isLogIn)
    }
    checkLoginStatus()
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    // Clear localStorage and update state
    localStorage.clear()
    setIsLoggedIn(false)
    setIsMenuOpen(false) // Close the menu if open
  }

  return (
    <nav className="bg-blue-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center tracking-wider justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold tracking-wider text-white">
          IPL Management
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-yellow-400 transition duration-200 text-xl font-semibold">
            Home
          </Link>
          <div className="flex space-x-4">
            {
              isLoggedIn ? (
                <>
                  <Button onClick={handleLogout} className="text-white hover:text-yellow-400 transition duration-200 text-xl font-semibold">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="text-white hover:text-yellow-400 transition duration-200 text-xl font-semibold">
                    Login
                  </Link>
                  <Link to="/auth/register" className="text-white hover:text-yellow-400 transition duration-200 text-xl font-semibold">
                    Register
                  </Link>
                </>
              )
            }
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-5 right-5 w-85 tracking-wider z-10 border border-gray-300 rounded-lg">
          <Link
            to="/"
            className="block px-4 py-2 text-black hover:bg-gray-700 transition duration-200 text-center cursor-pointer"
            onClick={toggleMenu}
          >
            Home
          </Link>
          {
              isLoggedIn ? (
                <>
                  <Button onClick={handleLogout}  className="text-white hover:text-yellow-400 transition duration-200 text-xl font-semibold">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="text-white hover:text-yellow-400 transition duration-200 text-xl font-semibold">
                    Login
                  </Link>
                  <Link to="/auth/register" className="text-white hover:text-yellow-400 transition duration-200 text-xl font-semibold">
                    Register
                  </Link>
                </>
              )
            }
        </div>
      )}
    </nav>
  )
}
