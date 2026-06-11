import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { formatDate } from '../../utils/formatters'
import Button from '../common/Button'
import Input from '../common/Input'

const ProductReviews = ({ productId, reviews = [] }) => {
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [showForm, setShowForm] = useState(false)
  const user = useSelector((state) => state.auth.user)
  
  const handleSubmitReview = (e) => {
    e.preventDefault()
    // Dispatch review submission action
    console.log('Review submitted:', newReview)
    setNewReview({ rating: 5, comment: '' })
    setShowForm(false)
  }
  
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex text-yellow-400 my-2">
              {'★'.repeat(Math.floor(averageRating))}
              {'☆'.repeat(5 - Math.floor(averageRating))}
            </div>
            <div className="text-gray-600">{reviews.length} reviews</div>
          </div>
          
          {user && !showForm && (
            <Button onClick={() => setShowForm(true)}>
              Write a Review
            </Button>
          )}
        </div>
      </div>
      
      {/* Review Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitReview}
          className="bg-white border rounded-lg p-6 mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating })}
                  className={`text-2xl ${rating <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <Input
            label="Your Review"
            type="textarea"
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="h-32"
          />
          
          <div className="flex gap-2 mt-4">
            <Button type="submit">Submit Review</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.form>
      )}
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="border-b pb-6"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold">{review.userName}</div>
                <div className="flex text-yellow-400 text-sm">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <div className="text-gray-500 text-sm">
                {formatDate(review.date)}
              </div>
            </div>
            <p className="text-gray-600">{review.comment}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ProductReviews