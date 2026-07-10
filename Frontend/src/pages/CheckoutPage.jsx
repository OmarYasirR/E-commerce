import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/checkout/CheckoutForm";
import PaymentForm from "../components/checkout/PaymentForm";
import OrderSummary from "../components/checkout/OrderSummary";
import { createOrder, clearCurrentOrder } from "../store/slices/orderSlice";
import { clearCart, fetchCart } from "../store/slices/cartSlice";
import { showToast } from "../components/common/Toast";
import Loader from "../components/common/Loader";

// Load Stripe with better error handling
const stripePromise = (async () => {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  console.log(stripeKey)
  if (!stripeKey) {
    console.error(
      "Stripe public key is missing! Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file",
    );
    return null;
  }

  try {
    const stripe = await loadStripe(stripeKey);
    return stripe;
  } catch (error) {
    console.error("Failed to load Stripe:", error);
    return null;
  }
})();

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    items,
    total,
    loading: cartLoading,
  } = useSelector((state) => state.cart);
  const { loading: orderLoading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    if (!isAuthenticated) {
      // Optionally redirect to login, or keep as is for testing
      console.log('User not authenticated, redirecting to login');
      navigate("/login", { state: { from: "/checkout" } });
    }
    dispatch(fetchCart());

    // Check Stripe availability
    stripePromise.then((stripe) => {
      if (stripe) {
        setStripeReady(true);
      } else {
        setStripeError("Stripe is not configured. Please contact support.");
      }
    });
  }, [dispatch, isAuthenticated, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0 && !isCreatingOrder) {
      navigate("/cart");
    }
  }, [items.length, cartLoading, navigate, isCreatingOrder]);

  if (cartLoading) return <Loader />;

  const handleShippingSubmit = async (data) => {
    setShippingData(data);
    setIsCreatingOrder(true);

    try {
      const shippingAddress = {
        fullName: `${data.firstName} ${data.lastName}`,
        addressLine1: data.address,
        addressLine2: data.addressLine2 || "",
        city: data.city,
        state: data.state,
        postalCode: data.zipCode,
        country: data.country,
        phone: data.phone,
      };

      const formattedItems = items.map((item) => {
        // Get product ID from various possible locations
        const productId = item.productId || item.product?._id || item._id;
        
        if (!productId) {
          console.error('Invalid item structure:', item);
          throw new Error("Cart item missing product ID");
        }

        return {
          product: productId, // Use 'product' field, not 'productId'
          quantity: item.quantity,
          price: item.price,
          variant: item.variant || {},
        };
      });

      // Calculate subtotal
      const subtotal = items.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0,
      );
      
      // Calculate total with shipping
      const shippingCost = data.shippingCost || 0;
      const totalAmount = subtotal + shippingCost;

      const orderData = {
        items: formattedItems,
        shippingAddress: shippingAddress,
        paymentMethod: "stripe",
        shippingMethod: data.shippingMethod || "standard",
        shippingCost: shippingCost,
        subtotal: subtotal,
        totalAmount: totalAmount,
        notes: "",
      };

      console.log("Sending order data:", JSON.stringify(orderData, null, 2));

      const result = await dispatch(createOrder(orderData)).unwrap();
      console.log("Order created:", result);

      // Handle different response structures
      const orderId = result?.data?._id || result?._id || result?.id;
      setCreatedOrder({ ...result, _id: orderId });
      setStep(2);
    } catch (error) {
      console.error("Failed to create order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create order";
      showToast("error", errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const orderId = createdOrder?._id;
      
      if (!orderId) {
        throw new Error("Order ID not found");
      }

      console.log("Payment successful for order:", orderId, paymentResult);

      // Clear cart and current order from state
      await dispatch(clearCart());
      dispatch(clearCurrentOrder());
      
      showToast("success", `Payment successful! Order placed successfully.`);
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error("Payment success handling error:", error);
      showToast(
        "error",
        error?.message || "Payment was successful but order update failed",
      );
    }
  };

  // Show error if Stripe is not configured
  if (stripeError && step === 2) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Payment System Not Configured
          </h2>
          <p className="text-red-600 mb-4">{stripeError}</p>
          <button onClick={() => setStep(1)} className="btn-primary">
            Go Back to Shipping
          </button>
        </div>
      </div>
    );
  }

  // Show loading while creating order  
  if (isCreatingOrder) {
    return (
      <div className="container-custom py-8 mt-3"> 
        <Loader message="Creating your order, please wait..." />
      </div>
    );
  }

  // Don't render if cart is empty
  if (items.length === 0) {
    return null;
  }

  // Calculate order summary values
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingData?.shippingCost || 0;
  const orderTotal = subtotal + shippingCost;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Steps Indicator */}
          <div className="flex mb-8 border-b pb-4">
            <div
              className={`flex-1 text-center ${step === 1 ? "text-primary-600" : "text-gray-400"}`}
            >
              <div className="font-semibold">1. Shipping Information</div>
              {step === 1 && (
                <div className="h-1 w-16 bg-primary-600 mx-auto mt-2 rounded-full"></div>
              )}
            </div>
            <div
              className={`flex-1 text-center ${step === 2 ? "text-primary-600" : "text-gray-400"}`}
            >
              <div className="font-semibold">2. Payment</div>
              {step === 2 && (
                <div className="h-1 w-16 bg-primary-600 mx-auto mt-2 rounded-full"></div>
              )}
            </div>
          </div>

          {step === 1 && (
            <CheckoutForm
              onSubmit={handleShippingSubmit}
              initialData={shippingData || {}}
              loading={isCreatingOrder}
            />
          )}

          {step === 2 && stripeReady && createdOrder && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                amount={orderTotal}
                orderId={createdOrder?._id}
              />
            </Elements>
          )}

          {step === 2 && !stripeReady && !stripeError && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payment system...</p>
            </div>
          )}

          {step === 2 && !createdOrder && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Preparing order...</p>
            </div>
          )}
        </div>

        <div>
          <OrderSummary 
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={orderTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;