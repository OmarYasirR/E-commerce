import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" />
}

export default PublicRoute