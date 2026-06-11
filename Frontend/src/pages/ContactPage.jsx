import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { showToast } from '../components/common/Toast';
import { IoLocation, IoMail, IoCall, IoTime } from 'react-icons/io5';
import api from '../services/api';

const ContactPage = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [isSent, setIsSent] = useState(false);
  
  const onSubmit = async (data) => {
    try {
      // Send contact form to backend
      await api.post('/contact', data);
      showToast('success', 'Message sent successfully! We\'ll get back to you soon.');
      reset();
      setIsSent(true);
      setTimeout(() => setIsSent(false), 5000);
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };
  
  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <IoLocation className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">123 Commerce Street<br />New York, NY 10001<br />United States</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <IoMail className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">support@shophub.com</p>
                    <p className="text-gray-600">sales@shophub.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <IoCall className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">+1 (555) 987-6543</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <IoTime className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-gray-600">Monday - Friday: 9am - 6pm</p>
                    <p className="text-gray-600">Saturday: 10am - 4pm</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
              
              {isSent && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                  Thank you for your message! We'll respond within 24 hours.
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Your name"
                    {...register('name', { required: 'Name is required' })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                
                <Input
                  label="Phone Number"
                  placeholder="Your phone number"
                  {...register('phone')}
                />
                
                <Input
                  label="Subject"
                  placeholder="Subject"
                  {...register('subject', { required: 'Subject is required' })}
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    {...register('message', { required: 'Message is required' })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;