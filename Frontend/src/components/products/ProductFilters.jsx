import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoFilter, IoClose } from 'react-icons/io5'

const ProductFilters = ({ onFilterChange, categories, priceRange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    minPrice: priceRange?.min || 0,
    maxPrice: priceRange?.max || 1000,
    sortBy: 'newest',
    rating: 0
  })
  
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Best Rating' },
    { value: 'popular', label: 'Most Popular' }
  ]
  
  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }
  
  const clearFilters = () => {
    const resetFilters = {
      category: '',
      minPrice: priceRange?.min || 0,
      maxPrice: priceRange?.max || 1000,
      sortBy: 'newest',
      rating: 0
    }
    setFilters(resetFilters)
    onFilterChange?.(resetFilters)
  }
  
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleChange('category', e.target.value)}
              className="mr-2"
            />
            <span>All Categories</span>
          </label>
          {categories?.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="mr-2"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min={priceRange?.min || 0}
            max={priceRange?.max || 1000}
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${filters.minPrice}</span>
            <span>${filters.maxPrice}</span>
          </div>
        </div>
      </div>
      
      {/* Rating Filter */}
      <div>
        <h3 className="font-semibold mb-3">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={(e) => handleChange('rating', parseInt(e.target.value))}
                className="mr-2"
              />
              <span>{rating}+ Stars</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Sort By */}
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Clear Filters Button */}
      <button
        onClick={clearFilters}
        className="w-full btn-outline"
      >
        Clear All Filters
      </button>
    </div>
  )
  
  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden btn-outline flex items-center gap-2"
      >
        <IoFilter /> Filters
      </button>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <FilterContent />
      </div>
      
      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-xl z-50 overflow-y-auto md:hidden"
            >
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setIsOpen(false)}>
                  <IoClose size={24} />
                </button>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ProductFilters