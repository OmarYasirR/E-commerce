import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            Welcome to ShopHub, your number one source for all things. We're dedicated to giving you 
            the very best of products, with a focus on quality, customer service, and uniqueness.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-6">
            Founded in 2024, ShopHub has come a long way from its beginnings. When we first started out, 
            our passion for providing the best products drove us to start our own business. We now serve 
            customers all over the world and are thrilled to be a part of the e-commerce industry.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            Our mission is to provide exceptional products and service that exceed our customers' expectations. 
            We strive to offer the best shopping experience possible, with fast shipping, secure payments, 
            and dedicated customer support.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            <li>High-quality products from trusted brands</li>
            <li>Competitive prices and regular discounts</li>
            <li>24/7 excellent customer service</li>
            <li>Fast and reliable worldwide shipping</li>
            <li>30-day money-back guarantee</li>
            <li>Secure payment processing</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
          <p className="text-gray-600 mb-6">
            We believe in honesty, integrity, and putting our customers first. Every decision we make 
            is guided by our commitment to providing the best possible service and value to our customers.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;