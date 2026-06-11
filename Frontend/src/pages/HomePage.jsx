import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProducts } from '../store/slices/productSlice';
import ProductGrid from '../components/products/ProductGrid';
import Loader from '../components/common/Loader';
import { 
  IoArrowForward, 
  IoRocketOutline, 
  IoChatbubblesOutline, 
  IoCashOutline 
} from 'react-icons/io5';

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 8, isFeatured: true }));
    console.log(products);
  }, [dispatch]);
  
  
  const featuredProducts = products.slice(0, 8);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold mb-4"
            >
              Summer Sale 2024
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl mb-6"
            >
              Up to 50% off on selected items. Limited time offer!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Now <IoArrowForward className="ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Free Shipping', 
                desc: 'On orders over $100', 
                icon: IoRocketOutline 
              },
              { 
                title: '24/7 Support', 
                desc: 'Customer service', 
                icon: IoChatbubblesOutline 
              },
              { 
                title: 'Money Back', 
                desc: '30-day guarantee', 
                icon: IoCashOutline 
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <feature.icon className="text-4xl mb-3 mx-auto text-primary-600" />
                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-2">Featured Products</h2>
          <p className="text-gray-600 text-center mb-10">Check out our best selling items</p>
          {loading ? <Loader /> : <ProductGrid products={featuredProducts} />}
        </div>
      </section>
    </div>
  );
};

export default HomePage;