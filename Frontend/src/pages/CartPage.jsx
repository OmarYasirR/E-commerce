import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCart } from '../store/slices/cartSlice';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Loader from '../components/common/Loader';
import { IoArrowBack } from 'react-icons/io5';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, loading, itemCount } = useSelector((state) => state.cart);
  
  useEffect(() => {
    dispatch(fetchCart());
    console.log(items)
  }, [dispatch]);
  
  if (loading) return <Loader />;
  
  if (items.length === 0 || itemCount === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
        <Link to="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-8">
      <Link to="/shop" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6">
        <IoArrowBack className="mr-2" /> Continue Shopping
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({itemCount} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg">
            {items.map((item) => (
              <CartItem key={item.product?._id || item.product} item={item} />
            ))}
          </div>
        </div>
        
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
};

export default CartPage;