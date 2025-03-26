"use client"

import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
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
            <Link
              to="/auth/login"
              className="px-5 py-2 bg-yellow-400 text-black font-medium rounded-lg shadow-md hover:bg-yellow-500 transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="px-5 py-2 bg-white text-black font-medium border border-black-400 rounded-lg shadow-md hover:bg-gray-200 hover:text-black transition duration-300"
            >
              Register
            </Link>
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
          <Link
            to="/auth/login"
            className="block cursor-pointer px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 mx-4 my-2 text-center transition duration-300"
            onClick={toggleMenu}
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            className="block cursor-pointer px-4 py-2 bg-white text-black border border-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-white mx-4 my-2 text-center transition duration-300"
            onClick={toggleMenu}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  )
}
