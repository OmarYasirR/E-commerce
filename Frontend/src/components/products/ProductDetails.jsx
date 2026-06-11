import React, { useState, useEffect } from 'react'
import {useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { IoCartOutline, IoHeartOutline, IoHeartSharp } from 'react-icons/io5'
import { addToCart } from '../../store/slices/cartSlice'
import { formatPrice } from '../../utils/formatters'
import Button from '../common/Button'


const ProductDetails = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const dispatch = useDispatch()
  const { isAdding } = useSelector(state => state.cart)
  
  const handleAddToCart = () => {
  // if product is allready in cart, we should update quantity instead of adding duplicate entry
  
    dispatch(addToCart({ 
      productId: product._id, 
      quantity: quantity,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.images?.[0]
    }))
  }
  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1))
  
  // Helper function to get category name safely
  const getCategoryName = () => {
    if (!product.category) return 'Uncategorized'
    if (typeof product.category === 'string') return product.category
    if (typeof product.category === 'object') return product.category.name || 'Uncategorized'
    return 'Uncategorized'
  }
  
  // Helper function to get image URL safely
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/500x500?text=No+Image'
    if (typeof image === 'string') return image
    if (image.url) return image.url
    return 'https://via.placeholder.com/500x500?text=No+Image'
  }
  
  // Get rating from product.ratings object
  const getRating = () => {
    if (product.ratings && product.ratings.average) {
      return product.ratings.average
    }
    if (product.rating) return product.rating
    return 0
  }
  
  // Get review count
  const getReviewCount = () => {
    if (product.ratings && product.ratings.count) {
      return product.ratings.count
    }
    if (product.reviews) return product.reviews
    return 0
  }
  
  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    }
    return 0
  }
  
  // Get stock status
  const getStockStatus = () => {
    if (product.quantity === 0) return 'Out of Stock'
    if (product.quantity < 10) return `Only ${product.quantity} left in stock`
    return `${product.quantity} in stock`
  }
  
  const rating = getRating()
  const reviewCount = getReviewCount()
  const discountPercentage = getDiscountPercentage()
  const stockStatus = getStockStatus()
  const categoryName = getCategoryName()

  useEffect(() => {
    console.log(isAdding)
  }, [isAdding])
  
  
  // Get images array
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: 'https://via.placeholder.com/500x500?text=No+Image' }]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Product Images */}
      <div>
        <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden aspect-square">
          <img
            src={getImageUrl(images[selectedImage])}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'
            }}
          />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`border rounded-lg overflow-hidden aspect-square ${
                  selectedImage === index ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-200'
                }`}
              >
                <img 
                  src={getImageUrl(image)} 
                  alt={`${product.name} ${index + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i}>
                {i < Math.floor(rating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-gray-600 ml-2">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        
        {/* Price */}
        <div className="mb-4">
          {discountPercentage > 0 ? (
            <>
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-gray-400 line-through ml-2">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                Save {discountPercentage}%
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        
        {/* Description */}
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        {/* Quantity Selector */}
        <div className="flex items-center gap-4 mb-6">
          <span className="font-semibold">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="px-3 py-1 border-r hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-4 py-1 min-w-[50px] text-center">{quantity}</span>
            <button
              onClick={incrementQuantity}
              disabled={product.quantity > 0 && quantity >= product.quantity}
              className="px-3 py-1 border-l hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <span className={`text-sm ${product.quantity < 10 ? 'text-red-500' : 'text-gray-600'}`}>
            {stockStatus}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={handleAddToCart} 
            className="flex-1 disabled:opacity-50"
            disabled={product.quantity === 0 || isAdding}
          >
            <IoCartOutline className="inline mr-2" />
            {product.quantity === 0 ? 'Out of Stock' : isAdding? 'Adding' : 'Add to Cart'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            {isWishlisted ? <IoHeartSharp className="text-red-500" /> : <IoHeartOutline />}
          </Button>
        </div>
        
        {/* Product Details */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Product Details</h3>
          <ul className="text-gray-600 space-y-1 text-sm">
            {product.sku && <li><span className="font-medium">SKU:</span> {product.sku}</li>}
            <li><span className="font-medium">Category:</span> {categoryName}</li>
            {product.brand && <li><span className="font-medium">Brand:</span> {product.brand}</li>}
          </ul>
        </div>
        
        {/* Additional Info */}
        {product.tags && product.tags.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails