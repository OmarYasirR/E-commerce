import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../store/slices/userSlice';
import { addToCart } from '../store/slices/cartSlice';
import { showToast } from '../components/common/Toast';
import Loader from '../components/common/Loader';
import { IoHeart, IoCart, IoTrash } from 'react-icons/io5';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlist, loading } = useSelector((state) => state.user);
  
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);
  
  const handleRemoveFromWishlist = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      showToast('success', 'Removed from wishlist');
    } catch (error) {
      showToast('error', 'Failed to remove from wishlist');
    }
  };
  
  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      showToast('success', `${product.name} added to cart!`);
    } catch (error) {
      showToast('error', 'Failed to add to cart');
    }
  };
  
  if (loading) return <Loader />;
  
  if (wishlist.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <IoHeart size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6">Save your favorite items here</p>
        <Link to="/shop" className="btn-primary inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Link to={`/product/${product._id}`}>
              <img
                src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="p-4">
              <Link to={`/product/${product._id}`}>
                <h3 className="font-semibold text-lg hover:text-primary-600 transition">
                  {product.name}
                </h3>
              </Link>
              <p className="text-primary-600 font-bold text-xl mt-2">
                ${product.price?.toFixed(2)}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  <IoCart size={16} />
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="px-3 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition"
                >
                  <IoTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;