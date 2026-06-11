import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserOrders } from '../store/slices/orderSlice';
import Loader from '../components/common/Loader';
import { IoCalendar, IoCash, IoLocation } from 'react-icons/io5';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, pagination } = useSelector((state) => state.orders);
  const [currentPage, setCurrentPage] = React.useState(1);
  
  useEffect(() => {
    dispatch(fetchUserOrders({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);
  
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  if (loading) return <Loader />;
  
  if (orders.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
        <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
        <Link to="/shop" className="btn-primary inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <Link to={`/orders/${order._id}`} className="text-primary-600 hover:underline">
                    <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <IoCalendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <IoCash size={14} />
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <IoLocation className="mt-0.5 flex-shrink-0" />
                  <span>
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {' '}
                    {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Link
                  to={`/orders/${order._id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {pagination.pages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;