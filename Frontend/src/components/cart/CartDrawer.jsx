import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { IoClose, IoCartOutline } from 'react-icons/io5'
import CartItem from './CartItem'
import { clearCart } from '../../store/slices/cartSlice'
import { formatPrice } from '../../utils/formatters'
import Button from '../common/Button'

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalAmount } = useSelector((state) => state.cart)
  
  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <IoCartOutline /> Shopping Cart ({items.length})
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <IoClose size={24} />
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <IoCartOutline size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <Button onClick={onClose} className="mt-4">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div>
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="text-red-500 text-sm mt-4 hover:text-red-600"
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <Button onClick={handleCheckout} className="w-full">
                  Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer