"use client"

import { useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { authService } from '@/lib/auth'
import { toast } from 'sonner'

export default function Hero() {
    const navigate = useNavigate()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const checkLoginStatus = async () => {
            const isLogIn = await authService.isLoggedIn()
            setIsLoggedIn(isLogIn)
            if (isLogIn) {
                navigate({ to: "/" }) // Redirect to home if already logged in
            }
        }
        checkLoginStatus()
    }, [navigate])

    const handleProtectedNavigation = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, path: string) => {
        if (isLoggedIn) {
            e.preventDefault() // Prevent navigation
            toast.info('You are already logged in! Redirecting to dashboard...')
            navigate({ to: "/app/dashboard" }) 
        } else {
            navigate({ to: path }) // Navigate to the desired path
        }
    }

    return (
        <div className="bg-gray-100 text-gray-900 min-h-screen px-8 py-10 rounded-xl">
            {/* Hero Section */}
            <section className="bg-gray-600 text-white py-20 rounded-lg shadow-lg">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-xl md:text-6xl font-extrabold tracking-wide mb-6">
                        Welcome to IPL Management
                    </h1>
                    <p className="text-lg md:text-xl font-medium mb-8">
                        Manage your IPL teams, matches, and players effortlessly.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            to="/auth/login"
                            onClick={(e) => handleProtectedNavigation(e, "/auth/login")}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/auth/register"
                            onClick={(e) => handleProtectedNavigation(e, "/auth/register")}
                            className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
                        >
                            Register Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Why Choose IPL Management?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-t-4 border-blue-600">
                            <div className="text-yellow-500 text-4xl mb-4">🏏</div>
                            <h3 className="text-xl font-bold mb-2">Team Management</h3>
                            <p className="text-gray-600">
                                Easily manage your IPL teams, players, and stats in one place.
                            </p>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-t-4 border-blue-600">
                            <div className="text-yellow-500 text-4xl mb-4">📅</div>
                            <h3 className="text-xl font-bold mb-2">Match Scheduling</h3>
                            <p className="text-gray-600">
                                Plan and organize matches with our intuitive scheduling tools.
                            </p>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-t-4 border-blue-600">
                            <div className="text-yellow-500 text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-bold mb-2">Real-Time Analytics</h3>
                            <p className="text-gray-600">
                                Get real-time insights and analytics to improve your strategies.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call-to-Action Section */}
            <section className="bg-yellow-200 text-black py-16 rounded-lg shadow-lg">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg md:text-xl font-medium mb-8">
                        Join IPL Management today and take your team to the next level.
                    </p>
                    <Link
                        to="/auth/register"
                        onClick={(e) => handleProtectedNavigation(e, "/auth/register")}
                        className="px-8 py-3 bg-white text-black font-semibold border border-black rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
                    >
                        Register Now
                    </Link>
                </div>
            </section>
        </div>
    )
}