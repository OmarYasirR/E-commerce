import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth)
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute