import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { register as registerUser } from '../../store/slices/authSlice'
import Input from '../common/Input'
import Button from '../common/Button'
import { showToast } from '../common/Toast'

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
})

const RegisterForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  })
  
  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...userData } = data
      await dispatch(registerUser(userData)).unwrap()
      showToast('success', 'Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      showToast('error', error.message || 'Registration failed')
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="John Doe"
        {...register('name')}
        error={errors.name?.message}
      />
      
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
      
      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />
      
      <label className="flex items-center">
        <input
          type="checkbox"
          onChange={(e) => setShowPassword(e.target.checked)}
          className="mr-2"
        />
        <span className="text-sm text-gray-600">Show passwords</span>
      </label>
      
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Create Account
      </Button>
      
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
          Sign in
        </Link>
      </p>
    </form>
  )
}

export default RegisterForm