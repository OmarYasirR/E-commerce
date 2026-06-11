import React from 'react'
import { useSelector } from 'react-redux'
import { formatPrice } from '../../utils/formatters'

const OrderSummary = () => {
  const { items, total, subtotal } = useSelector((state) => state.cart)
  
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1
  const grandTotal = subtotal + shipping + tax
  
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-3 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary-600">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary