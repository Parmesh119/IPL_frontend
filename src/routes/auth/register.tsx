"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { register_schema, type TRegister } from '@/schemas/auth-schema'
import { toast } from "sonner"
import { Link, redirect, useNavigate } from '@tanstack/react-router'
import { authService } from '@/lib/auth'
import { registerAction } from '@/lib/actions'
import { useMutation } from '@tanstack/react-query' 
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'


export const Route = createFileRoute('/auth/register')({
  component: RegisterComponent,
  loader: async () => {
    const isLogedIn = await authService.isLoggedIn()
    if(isLogedIn) {
      return redirect({ to: '/'})
    }
    return {
      title: 'Register',
    }
  }
})

function RegisterComponent() {

  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TRegister>({
    resolver: zodResolver(register_schema),
    defaultValues: {
      username: '',
      name: '',
      password: '',
    }
  })

  const registerMutation = useMutation({
    mutationFn: registerAction,
    onSuccess: async (data) => {
      if(data) {
        toast.success('Registration Successful', {
          description: "You can now login with your credentials",
        })
        navigate({ to: '/auth/login' })
      }
    },
    onError: (error) => {
      console.error('Registration error:', error)
      toast.error(`Registration failed: ${error.message}`)
    }
  })

  const onSubmit = (data: TRegister) => {
    registerMutation.mutate(data)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
      >
        <div className="flex justify-between items-center">
          <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
            Create an Account
          </h1>
          
        </div>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Sign up to get started with our platform
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
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              errors.username
                ? 'border-red-500 focus:ring-red-500'
                : 'focus:ring-blue-500'
            }`}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Name field */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'focus:ring-blue-500'
            }`}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
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
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              errors.password
                ? 'border-red-500 focus:ring-red-500'
                : 'focus:ring-blue-500'
            }`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400"
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
          className="w-full cursor-pointer py-2 text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Register
        </Button>

        {/* Login Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
