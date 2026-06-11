import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { formatPrice } from '../../utils/formatters'
import Button from '../common/Button'
  
const CartSummary = () => {
  const navigate = useNavigate()
  const { items, total, subtotal  } = useSelector((state) => state.cart)


  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1
  const grandTotal = subtotal + shipping + tax
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span>Subtotal ({items.length} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary-600">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>
      
      {subtotal > 0 && (
        <Button
          onClick={() =>   navigate('/checkout')}
          className="w-full"
        >
          Proceed to Checkout
        </Button>
      )}
      
      {subtotal < 100 && subtotal > 0 && (
        <p className="text-sm text-gray-600 text-center mt-3">
          Add ${formatPrice(100 - subtotal)} more for free shipping!
        </p>
      )}
    </div>
  )
}

export default CartSummary