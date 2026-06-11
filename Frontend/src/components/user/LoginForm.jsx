import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { login } from '../../store/slices/authSlice'
import Input from '../common/Input'
import Button from '../common/Button'
import { showToast } from '../common/Toast'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
})

const LoginForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange'
  })
  
  const handleLogin = async () => {
    // Get form values
    const data = getValues()
    
    // Validate manually
    if (!data.email || !data.password) {
      showToast('error', 'Please fill in all fields')
      return
    }
    
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const result = await dispatch(login({
        email: data.email.trim(),
        password: data.password
      })).unwrap()
      
      if (result) {
        showToast('success', 'Login successful!')
        navigate('/')
      }
    } catch (error) {
      showToast('error', error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFormSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleLogin()
    return false
  }
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        {...register('email')}
        error={errors.email?.message}
      />
      
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••"
        {...register('password')}
        error={errors.password?.message}
      />
      
      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            onChange={(e) => setShowPassword(e.target.checked)}
            className="mr-2 cursor-pointer"
          />
          <span className="text-sm text-gray-600">Show password</span>
        </label>
        <Link 
          to="/forgot-password" 
          onClick={(e) => e.stopPropagation()} 
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Forgot password?
        </Link>
      </div>
      
      <Button 
        type="submit" 
        isLoading={isLoading} 
        className="w-full"
        disabled={isLoading}
      >
        Sign In
      </Button>
      
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link 
          to="/register" 
          onClick={(e) => e.stopPropagation()}
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}

export default LoginForm