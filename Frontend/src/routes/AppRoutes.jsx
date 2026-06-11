import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header, Footer } from '../components/layout'
import HomePage from '../pages/HomePage'
import ShopPage from '../pages/ShopPage'
import ProductPage from '../pages/ProductPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProfilePage from '../pages/ProfilePage'
import OrdersPage from '../pages/OrdersPage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import NotFoundPage from '../pages/NotFoundPage'
import PrivateRoute from './PrivateRoute'

const AppRoutes = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default AppRoutes