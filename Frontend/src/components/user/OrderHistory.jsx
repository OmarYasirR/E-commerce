import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserOrders } from '../../store/slices/orderSlice'
import { formatPrice, formatDate } from '../../utils/formatters'
import Loader from '../common/Loader'
import { motion } from 'framer-motion'

const OrderHistory = () => {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector((state) => state.orders)
  
  useEffect(() => {
    dispatch(fetchUserOrders())
  }, [dispatch])
  
  if (loading) return <Loader />
  
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No orders yet.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-gray-600">Order #{order.id}</p>
              <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary-600">{formatPrice(order.total)}</p>
              <span className={`text-xs px-2 py-1 rounded ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="space-y-2">
              {order.items.slice(0, 2).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              {order.items.length > 2 && (
                <p className="text-sm text-gray-500">
                  +{order.items.length - 2} more items
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default OrderHistory