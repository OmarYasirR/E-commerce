import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderById,
  cancelOrder,
  clearCurrentOrder,
} from "../store/slices/orderSlice";
import Loader from "../components/common/Loader";
import { showToast } from "../components/common/Toast";
import {
  IoCheckmarkCircle,
  IoTimeOutline,
  IoBus,
  IoHome,
} from "react-icons/io5";
import Modal from "../components/common/Modal";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.orders);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isdeleting, setIsDeleting] = useState(false);



  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    try {
      setIsDeleting(true);
      await dispatch(
        cancelOrder({ id, reason: cancelReason || "Customer requested cancellation" }),
      ).unwrap();
      showToast("success", "Order cancelled successfully");
      dispatch(fetchOrderById(id));
    } catch (error) {
      showToast("error", error || "Failed to cancel order");
    } finally {
      setIsDeleting(false);
    }
    setCancelModalOpen(false);
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <IoTimeOutline className="text-yellow-500" size={24} />,
      processing: <IoTimeOutline className="text-blue-500" size={24} />,
      confirmed: <IoCheckmarkCircle className="text-indigo-500" size={24} />,
      shipped: <IoBus className="text-purple-500" size={24} />,
      delivered: <IoHome className="text-green-500" size={24} />,
      cancelled: <IoCheckmarkCircle className="text-red-500" size={24} />,
    };
    return (
      icons[status] || <IoTimeOutline className="text-gray-500" size={24} />
    );
  };

  if (loading) return <Loader fullScreen />;

  if (!currentOrder) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <button
          onClick={() => navigate("/orders")}
          className="btn-primary mt-4"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <button
        onClick={() => navigate("/orders")}
        className="text-primary-600 hover:underline mb-6"
      >
        ← Back to Orders
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Order #{currentOrder.orderNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            Placed on {new Date(currentOrder.createdAt).toLocaleDateString()}
          </p>
        </div>
        {currentOrder.status === "pending" && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="btn-secondary bg-red-600 text-white hover:bg-red-700"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Order Status Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Order Status</h2>
        <div className="flex justify-between">
          {["pending", "processing", "confirmed", "shipped", "delivered"].map(
            (status, index) => {
              const isCompleted =
                currentOrder.timeline?.some((t) => t.status === status) ||
                (status === "pending" && currentOrder.status === "pending");
              const isCurrent = currentOrder.status === status;

              return (
                <div key={status} className="text-center flex-1">
                  <div
                    className={`relative ${index !== 4 ? 'after:content-[""] after:absolute after:top-4 after:left-1/2 after:w-full after:h-0.5 after:bg-gray-300' : ""}`}
                  >
                    <div
                      className={`relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-500"
                      } ${isCurrent ? "ring-4 ring-green-200" : ""}`}
                    >
                      {getStatusIcon(status)}
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium capitalize">
                    {status}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-gray-500">
                      {currentOrder.timeline?.find((t) => t.status === status)
                        ?.timestamp
                        ? new Date(
                            currentOrder.timeline.find(
                              (t) => t.status === status,
                            ).timestamp,
                          ).toLocaleDateString()
                        : status === "pending"
                          ? new Date(
                              currentOrder.createdAt,
                            ).toLocaleDateString()
                          : ""}
                    </p>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {currentOrder.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b last:border-0"
                >
                  <img
                    src={item.image || "https://via.placeholder.com/80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-primary-600 font-semibold">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${currentOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${currentOrder.shippingCost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${currentOrder.tax?.toFixed(2)}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${currentOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${currentOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              <p className="font-medium">
                {currentOrder.shippingAddress?.fullName}
              </p>
              <p>{currentOrder.shippingAddress?.addressLine1}</p>
              {currentOrder.shippingAddress?.addressLine2 && (
                <p>{currentOrder.shippingAddress.addressLine2}</p>
              )}
              <p>
                {currentOrder.shippingAddress?.city},{" "}
                {currentOrder.shippingAddress?.state}{" "}
                {currentOrder.shippingAddress?.postalCode}
              </p>
              <p>{currentOrder.shippingAddress?.country}</p>
              <p className="mt-2">
                Phone: {currentOrder.shippingAddress?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        isLoading={isdeleting}
        showFooter={true}
        onCancel={() => setCancelModalOpen(false)}
        title="Cancel Order"
        confirmText="Yes, Cancel"
        cancelText="No, Keep"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Reason for cancellation
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter reason for cancellation"
          />
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
