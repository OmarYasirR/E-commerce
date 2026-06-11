import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  IoPrint,
  IoDownload,
  IoMail,
  IoLocation,
  IoTime,
  IoCard,
  IoCarSportSharp,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoRefresh,
  IoArrowBack,
  IoChevronForward,
  IoReceipt,
  IoCash,
  IoLogoPaypal,
  IoCloudUpload,
  IoAlertCircle,
} from 'react-icons/io5';
import { FaStripeS, FaCreditCard } from 'react-icons/fa';
import { showToast } from '../../components/common/Toast';
import orderService from '../../services/orderService';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const OrderDetails = ({ order, onUpdate, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setTrackingNumber(order.trackingNumber || '');
    }
  }, [order]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <IoTime size={14} />, label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <IoRefresh size={14} />, label: 'Processing' },
      confirmed: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: <IoCheckmarkCircle size={14} />, label: 'Confirmed' },
      shipped: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: <IoCarSportSharp size={14} />, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <IoCheckmarkCircle size={14} />, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <IoCloseCircle size={14} />, label: 'Cancelled' },
    };
    return badges[status] || badges.pending;
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return badges[status] || badges.pending;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      stripe: <FaStripeS size={20} className="text-blue-600" />,
      razorpay: <FaCreditCard size={20} className="text-blue-600" />,
      paypal: <IoLogoPaypal size={20} className="text-blue-600" />,
      cod: <IoCash size={20} className="text-green-600" />,
      card: <IoCard size={20} className="text-purple-600" />,
    };
    return icons[method] || <IoCard size={20} />;
  };

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      await orderService.updateOrderStatus(order._id, selectedStatus, statusNote);
      showToast('success', `Order status updated to ${selectedStatus}`);
      setIsStatusModalOpen(false);
      setStatusNote('');
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await orderService.cancelOrder(order._id, cancelReason);
      showToast('success', 'Order cancelled successfully');
      setIsCancelModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    setLoading(true);
    try {
      await orderService.updateTracking(order._id, { trackingNumber });
      showToast('success', 'Tracking information updated');
      setIsTrackingModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update tracking');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const blob = await orderService.downloadInvoice(order._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('success', 'Invoice downloaded');
    } catch (error) {
      showToast('error', 'Failed to download invoice');
    }
  };

  const handleSendEmail = async () => {
    try {
      await orderService.sendOrderEmail(order._id);
      showToast('success', 'Email sent to customer');
    } catch (error) {
      showToast('error', 'Failed to send email');
    }
  };

  if (!order) return <Loader />;

  const statusBadge = getStatusBadge(order.status);
  const paymentStatusClass = getPaymentStatusBadge(order.paymentStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold dark:text-white">Order #{order.orderNumber}</h2>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.icon}
              {statusBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <IoTime size={14} />
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              {getPaymentMethodIcon(order.paymentMethod)}
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusClass}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            <IoRefresh size={16} />
            Update Status
          </button>
          <button
            onClick={() => setIsTrackingModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
          >
            <IoCarSportSharp size={16} />
            Add Tracking
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <IoDownload size={16} />
            Invoice
          </button>
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <IoMail size={16} />
            Email
          </button>
          {order.status === 'pending' && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              <IoCloseCircle size={16} />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 dark:text-white">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium dark:text-white">{item.name}</h4>
                    {item.variant && Object.keys(item.variant).length > 0 && (
                      <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {Object.entries(item.variant).map(([key, value]) => (
                          <span key={key}>{key}: {value}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity} × ${item.price?.toFixed(2)}
                      </span>
                      <span className="font-semibold dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4 dark:text-white">Order Timeline</h3>
              <div className="space-y-3">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative">
                      {index !== order.timeline.length - 1 && (
                        <div className="absolute top-6 left-2.5 w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
                      )}
                      <div className="w-5 h-5 rounded-full bg-primary-500"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium dark:text-white capitalize">{event.status}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 dark:text-white">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                <span className="dark:text-gray-300">${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Shipping:</span>
                <span className="dark:text-gray-300">${order.shippingCost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tax:</span>
                <span className="dark:text-gray-300">${order.tax?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary-600">${order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 dark:text-white">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium dark:text-white">{order.user?.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{order.user?.email}</p>
              {order.user?.phone && <p className="text-gray-500 dark:text-gray-400">{order.user.phone}</p>}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <IoLocation size={18} className="text-primary-500" />
              <h3 className="font-semibold dark:text-white">Shipping Address</h3>
            </div>
            <div className="text-sm space-y-1 dark:text-gray-300">
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              <p className="mt-2">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Tracking Information */}
          {(order.trackingNumber || order.trackingUrl) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoCarSportSharp size={18} className="text-primary-500" />
                <h3 className="font-semibold dark:text-white">Tracking Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="dark:text-gray-300">
                  <span className="text-gray-500">Tracking Number:</span> {order.trackingNumber}
                </p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline inline-flex items-center gap-1"
                  >
                    Track Package <IoChevronForward size={12} />
                  </a>
                )}
                {order.estimatedDelivery && (
                  <p className="text-gray-500">
                    Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoAlertCircle size={18} className="text-primary-500" />
                <h3 className="font-semibold dark:text-white">Order Notes</h3>
              </div>
              <p className="text-sm dark:text-gray-300">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Order Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Note (Optional)
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows="3"
              placeholder="Add a note about this status update..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Tracking Modal */}
      <Modal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        title="Add Tracking Information"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracking URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://tracking.carrier.com/..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsTrackingModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Skip
            </button>
            <button
              onClick={handleUpdateTracking}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Tracking'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ Cancelling this order will:
              <br />• Restore product quantities
              <br />• Notify the customer via email
              <br />• Process refund if payment was made
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancellation Reason
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows="3"
              placeholder="Enter reason for cancellation..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Go Back
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;