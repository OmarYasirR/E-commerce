import React from 'react'
import ProductCard from './ProductCard'
import Loader from '../common/Loader'
import { IoCashOutline } from 'react-icons/io5'

const ProductGrid = ({ products, loading, columns = 4 }) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }
  
  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {[...Array(8)].map((_, i) => (
          <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="bg-gray-200 h-64"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">
          <IoCashOutline className="mx-auto text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No products found.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
      </div>
    )
  }
  
  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid