import React from 'react'
import { motion } from 'framer-motion'

const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }
  
  const spinner = (
    <div className="flex justify-center items-center">
      <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
    </div>
  ) 
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {spinner}
        </motion.div>
      </div>
    )
  }
  
  return spinner
}

export default Loader