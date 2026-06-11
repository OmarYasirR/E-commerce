import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoClose } from 'react-icons/io5'

const Sidebar = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Menu</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <IoClose size={24} />
              </button>
            </div>
            <div className="p-4">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar