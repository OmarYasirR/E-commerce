import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { showToast } from '../common/Toast';
import { IoCart, IoEye } from 'react-icons/io5';

const RelatedProducts = ({ products, loading = false, title = "Related Products" }) => {
  const dispatch = useDispatch();

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ 
        productId: product._id, 
        quantity: 1 
      })).unwrap();
      showToast('success', `${product.name} added to cart!`);
    } catch (error) {
      showToast('error', 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Product Image */}
            <Link to={`/product/${product._id}`} className="block relative overflow-hidden">
              <img
                src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  SALE
                </span>
              )}
              {product.quantity === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold px-3 py-1 bg-red-600 rounded">Out of Stock</span>
                </div>
              )}
            </Link>

            {/* Product Info */}
            <div className="p-4">
              {/* Category */}
              {product.category && (
                <p className="text-xs text-gray-500 mb-1">
                  {typeof product.category === 'object' ? product.category.name : product.category}
                </p>
              )}

              {/* Product Name */}
              <Link to={`/product/${product._id}`}>
                <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 min-h-[48px]">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              {product.ratings && product.ratings.average > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.ratings.average)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.ratings.count})</span>
                </div>
              )}

              {/* Price */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-bold text-primary-600">
                  ${product.price?.toFixed(2)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.quantity === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  <IoCart size={16} />
                  {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                <Link
                  to={`/product/${product._id}`}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <IoEye size={16} className="text-gray-600" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Alternative: Horizontal scrolling version
export const RelatedProductsHorizontal = ({ products, loading = false, title = "You May Also Like" }) => {
  const dispatch = useDispatch();

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ 
        productId: product._id, 
        quantity: 1 
      })).unwrap();
      showToast('success', `${product.name} added to cart!`);
    } catch (error) {
      showToast('error', 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
          View All →
        </Link>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Link to={`/product/${product._id}`} className="block">
                <img
                  src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </Link>
              
              <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 min-h-[48px] text-sm">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ${product.price?.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity === 0}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                  >
                    <IoCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;