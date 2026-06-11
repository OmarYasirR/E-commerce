import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { IoCartOutline, IoHeartOutline } from 'react-icons/io5'
import { addToCart } from '../../store/slices/cartSlice'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const {currentProduct, isAdding} = useSelector((state) => state.cart)
  
  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(addToCart({ 
      productId: product._id, 
      quantity: 1,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.images?.[0]
    }))
  }
  
  // Get category name safely
  const getCategoryName = () => {
    if (!product.category) return ''
    if (typeof product.category === 'string') return product.category
    if (typeof product.category === 'object') return product.category.name
    return ''
  }
  
  // Get image URL safely
  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0]
      if (typeof firstImage === 'string') return firstImage
      if (firstImage.url) return firstImage.url
    }
    return 'https://via.placeholder.com/300x300?text=No+Image'
  }
  
  // Calculate discount percentage if compareAtPrice exists
  const getDiscountPercentage = () => {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    }
    return 0
  }
  
  const discountPercentage = getDiscountPercentage()
  const imageUrl = getImageUrl()
  const categoryName = getCategoryName()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="card group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
            }}
          />
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{discountPercentage}%
            </div>
          )}
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold px-3 py-1 bg-red-600 rounded text-sm">
                Out of Stock
              </span>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || (isAdding && currentProduct === product._id)}
            className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-primary-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <IoCartOutline size={18} />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Add wishlist functionality here
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-primary-600 hover:text-white transition-colors"
            aria-label="Add to wishlist"
          >
            <IoHeartOutline size={18} />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[48px] text-sm hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          {categoryName && (
            <p className="text-gray-500 text-xs mb-2">{categoryName}</p>
          )}
          <div className="flex items-center justify-between">
            <div>
              {discountPercentage > 0 ? (
                <>
                  <span className="text-lg font-bold text-primary-600">
                    ${(product.price).toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-lg font-bold text-primary-600">
                  ${product.price?.toFixed(2)}
                </span>
              )}
            </div>
            {product.ratings && (
              <div className="flex items-center">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-sm text-gray-600 ml-1">
                  {product.ratings.average?.toFixed(1) || 0}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard