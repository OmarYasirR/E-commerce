// src/components/checkout/PaymentForm.jsx
import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Button from '../common/Button'
import { showToast } from '../common/Toast'
import api from '../../services/api'

const PaymentForm = ({ onSuccess, amount, orderId }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardError, setCardError] = useState(null)
  
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: '"Inter", system-ui, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }
  
  const handleCardChange = (event) => {
    if (event.error) {
      setCardError(event.error.message)
    } else {
      setCardError(null)
    }
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    // Validate Stripe is ready
    if (!stripe || !elements) {
      showToast('error', 'Stripe is not initialized. Please try again.')
      return
    }
    
    // Validate orderId
    if (!orderId) {
      console.error('Order ID is missing:', { orderId });
      showToast('error', 'Order ID is missing. Please go back and try again.')
      return
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      showToast('error', 'Invalid payment amount')
      return
    }
    
    setIsProcessing(true)
    setCardError(null)
    
    try {
      console.log('Creating payment intent for order:', orderId);
      
      // Step 1: Create payment intent on backend
      const response = await api.post('/payments/create-intent', {
        orderId: orderId,
        paymentMethod: 'stripe'
      })
      
      console.log('Payment intent response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment intent')
      }
      
      const { clientSecret, paymentIntentId } = response.data.data
      
      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })
      
      if (confirmError) {
        throw new Error(confirmError.message)
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Step 3: Confirm payment on backend
        const confirmResponse = await api.post('/payments/confirm', {
          paymentIntentId: paymentIntentId,
          paymentMethodId: paymentIntent.payment_method
        })
        
        if (confirmResponse.data.success) {
          showToast('success', 'Payment successful!')
          if (onSuccess) {
            onSuccess(paymentIntent)
          }
        } else {
          throw new Error(confirmResponse.data.message || 'Payment verification failed')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed. Please try again.'
      showToast('error', errorMessage)
      setCardError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Don't render if orderId is missing
  if (!orderId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 mb-4">Order information is missing. Please go back and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh Page
        </button>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Card Details
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
          <CardElement 
            options={cardElementOptions} 
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <p className="text-sm text-red-500 mt-1">{cardError}</p>
        )}
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between font-bold">
          <span className="dark:text-white">Total Amount:</span>
          <span className="text-primary-600 dark:text-primary-400">${amount?.toFixed(2)}</span>
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing || cardError}
        isLoading={isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount?.toFixed(2)}`}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Your payment is secure and encrypted
      </p>
    </form>
  )
}

export default PaymentForm