import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { IoCartOutline, IoHeartOutline, IoPersonOutline, IoMenu, IoClose } from 'react-icons/io5'
import CartDrawer from '../cart/CartDrawer'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartItems = useSelector((state) => state.cart.items)
  const user = useSelector((state) => state.auth.user)
  
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  
  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-primary-600">
              ShopHub
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-primary-600 transition-colors">
                Shop
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
                Contact
              </Link>
            </nav>
            
            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button className="relative">
                <IoHeartOutline size={24} className="text-gray-700 hover:text-primary-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
              
              <button onClick={() => setIsCartOpen(true)} className="relative">
                <IoCartOutline size={24} className="text-gray-700 hover:text-primary-600" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </button>
              
              <Link to={user ? '/profile' : '/login'}>
                <IoPersonOutline size={24} className="text-gray-700 hover:text-primary-600" />
              </Link>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden py-4 border-t"
            >
              <div className="flex flex-col space-y-3">
                <Link to="/" className="text-gray-700 hover:text-primary-600">Home</Link>
                <Link to="/shop" className="text-gray-700 hover:text-primary-600">Shop</Link>
                <Link to="/about" className="text-gray-700 hover:text-primary-600">About</Link>
                <Link to="/contact" className="text-gray-700 hover:text-primary-600">Contact</Link>
              </div>
            </motion.nav>
          )}
        </div>
      </header>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Header