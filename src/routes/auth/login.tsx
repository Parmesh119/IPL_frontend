"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { authService } from '@/lib/auth'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { login_schema, type TLogin } from '@/schemas/auth-schema'
import { loginAction } from '@/lib/actions'
import axios from 'axios'
import { toast } from "sonner"
import { Eye, EyeOff } from 'lucide-react'

export const Route = createFileRoute('/auth/login')({
  component: LoginComponent,
  loader: async () => {
    const isLoggedIn = await authService.isLoggedIn()
    if (isLoggedIn) {
      return redirect({ to: '/app/dashboard' })
    }
  },
})

function LoginComponent() {

  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLogin>({
    resolver: zodResolver(login_schema),
    defaultValues: {
      username: '',
      password: '',
    }
  })

  const loginMutation = useMutation({
    mutationFn: loginAction,
    onSuccess: async (data) => {

      await authService.setTokens(data)

      toast.success('Login Successful', {
        description: "Welcome back! Redirecting to dashboard...",
        style: {
          background: "linear-gradient(90deg, #38A169, #2F855A)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      })

      navigate({ to: '/app/dashboard' })
    },
    onError: (error) => {
      console.error('Login error:', error)

      toast.error('Login Failed', {
        description: getErrorMessage(),
        style: {
          background: "linear-gradient(90deg, #E53E3E, #C53030)",
          color: "white",
          fontWeight: "bolder",
          fontSize: "13px",
          letterSpacing: "1px",
      }
      })
    },
  })

  const getErrorMessage = () => {
    if (!loginMutation.error) return null

    if (axios.isAxiosError(loginMutation.error) && loginMutation.error.response) {
      return loginMutation.error.response.data.message || 'Login failed. Please check your credentials.'
    }

    return 'Unable to connect to the server. Please try again later.'
  }

  const onSubmit = (data: TLogin) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700"
      >
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800 dark:text-white">
          Welcome Back
        </h1>
        <p className="mb-6 text-sm text-center text-gray-600 dark:text-gray-400">
          Please login to your account
        </p>

        {/* Username Field */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            autoFocus
            {...register('username')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 ${errors.username
              ? 'border-red-500 focus:ring-red-500'
              : 'focus:ring-blue-500 dark:focus:ring-blue-400'
              }`}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6 relative">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 ${errors.password
              ? 'border-red-500 focus:ring-red-500'
              : 'focus:ring-blue-500 dark:focus:ring-blue-400'
              }`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full cursor-pointer py-2 text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          Login
        </Button>

        {/* Register Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginComponent
