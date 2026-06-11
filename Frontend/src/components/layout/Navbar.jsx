import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  IoMenuOutline,
  IoCloseOutline,
  IoCartOutline,
  IoPersonOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoHeartOutline,
  IoGridOutline,
  IoSearchOutline,
  IoChevronDown,
  IoShieldOutline,
  IoBagOutline,
  IoReceiptOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoFolderOpen,
  IoFolderOutline,
} from "react-icons/io5";
import { logout } from "../../store/slices/authSlice";
import { toggleTheme } from "../../store/slices/uiSlice";
import { showToast } from "../common/Toast";
import logo from "../../assets/images/navLogo.svg";
import { fetchCart } from "../../store/slices/cartSlice";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);
  const { theme } = useSelector((state) => state.ui);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isDarkMode = theme === "dark";

  // useEffect(() => {
  //   dispatch(fetchCart())
  // }, [])
  

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);


  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    showToast("success", "Logged out successfully");
    navigate("/");
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    showToast("success", `${!isDarkMode ? "Dark" : "Light"} mode enabled`);
  };

  const navItems = [
    { path: "/", label: "Home", icon: null },
    { path: "/shop", label: "Shop", icon: null },
    { path: "/about", label: "About", icon: null },
    { path: "/contact", label: "Contact", icon: null },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg dark:bg-gray-900/95`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 group">
              <img src={logo} alt="ShopHub Logo" className="w-12 h-12" />
              <span className="hidden xl:inline text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
                ShopHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="relative group">
                  <span
                    className={`text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-700 group-hover:text-primary-600 dark:text-gray-300 dark:group-hover:text-primary-400"
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search Button (Desktop) */}
              <form onSubmit={handleSearch} className="hidden lg:block">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                  <IoSearchOutline
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                </div>
              </form>

              {/* Dark Mode Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleTheme}
                className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors dark:text-gray-300 dark:hover:text-primary-400"
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDarkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <IoSunnyOutline size={22} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, rotate: 180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <IoMoonOutline size={22} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors dark:text-gray-300 dark:hover:text-primary-400"
              >
                <IoCartOutline size={24} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors dark:hover:bg-gray-800"
                  >
                    <img
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${user?.name}&background=4f46e5&color=fff&rounded=true&size=32`
                      }
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <IoChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform dark:text-gray-400 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 dark:bg-gray-800 dark:border-gray-700"
                      >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {user?.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-100">
                            {user?.email}
                          </p>
                          {user?.role === "admin" && (
                            <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full dark:bg-purple-900/50 dark:text-purple-300">
                              Administrator
                            </span>
                          )}
                        </div>

                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 transition-colors dark:text-gray-300 dark:hover:bg-gray-700/50 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <IoPersonOutline
                              size={18}
                              className="text-gray-500 dark:text-gray-500"
                            />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            to="/orders"
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 transition-colors dark:text-gray-300 dark:hover:bg-gray-700/50 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <IoReceiptOutline
                              size={18}
                              className="text-gray-500 dark:text-gray-300"
                            />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            to="/wishlist"
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 transition-colors dark:text-gray-300 dark:hover:bg-gray-700/50 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <IoHeartOutline
                              size={18}
                              className="text-gray-500 dark:text-gray-300"
                            />
                            <span>Wishlist</span>
                          </Link>

                          {user?.role === "admin" && (
                            <>
                              <div className="border-t border-gray-100 my-2 dark:border-gray-700"></div>

                              <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-2 text-purple-600 transition-colors dark:text-purple-400 dark:hover:bg-purple-900/30 hover:bg-purple-50"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <IoShieldOutline size={18} />
                                <span>Admin Dashboard</span>
                              </Link>

                              <Link
                                to="/admin/products"
                                className="flex items-center gap-3 px-4 py-2 pl-11 text-sm text-purple-600 transition-colors dark:text-purple-400 dark:hover:bg-purple-900/30 hover:bg-purple-50"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <IoGridOutline size={16} />
                                <span>Manage Products</span>
                              </Link>

                              <Link
                                to="/admin/orders"
                                className="flex items-center gap-3 px-4 py-2 pl-11 text-sm text-purple-600 transition-colors dark:text-purple-400 dark:hover:bg-purple-900/30 hover:bg-purple-50"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <IoBagOutline size={16} />
                                <span>Manage Orders</span>
                              </Link>

                              <Link
                                to="/admin/users"
                                className="flex items-center gap-3 px-4 py-2 pl-11 text-sm text-purple-600 transition-colors dark:text-purple-400 dark:hover:bg-purple-900/30 hover:bg-purple-50"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <IoPersonOutline size={16} />
                                <span>Manage Users</span>
                              </Link>

                              <Link
                                to="/admin/coupons"
                                className="flex items-center gap-3 px-4 py-2 pl-11 text-sm text-purple-600 transition-colors dark:text-purple-400 dark:hover:bg-purple-900/30 hover:bg-purple-50"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <IoGridOutline size={16} />
                                <span>Manage Coupons</span>
                              </Link>
                            
                              
                              <Link 
                                to="/admin/categories" 
                                className="flex items-center gap-3 px-4 py-2 pl-11 text-sm text-purple-600 transition-colors dark:text-purple-400 dark:hover:bg-purple-900/30 hover:bg-purple-50"
                              >
                                <IoFolderOutline size={16} />
                                <span>Manage Categories</span>
                              </Link>

                            </>
                          )}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 transition-colors dark:text-red-400 dark:hover:bg-red-900/30 hover:bg-red-50"
                          >
                            <IoLogOutOutline size={18} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors dark:text-gray-300 dark:hover:text-primary-400"
                  >
                    <IoLogInOutline size={20} />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:flex items-center gap-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <IoPersonOutline size={18} />
                    <span className="text-nowrap">Sign Up</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors dark:text-gray-300 dark:hover:text-primary-400"
              >
                {isMobileMenuOpen ? (
                  <IoCloseOutline size={24} />
                ) : (
                  <IoMenuOutline size={24} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-4 md:hidden dark:bg-gray-900"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <IoSearchOutline
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
              </div>
            </form>

            {/* Dark Mode Toggle in Mobile Menu */}
            <button
              onClick={handleToggleTheme}
              className="flex items-center justify-between w-full py-3 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
            >
              <span className="flex items-center gap-2">
                {isDarkMode ? (
                  <IoSunnyOutline size={20} />
                ) : (
                  <IoMoonOutline size={20} />
                )}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
              <span className="text-sm text-gray-500">
                {isDarkMode ? "☀️" : "🌙"}
              </span>
            </button>

            {/* Mobile Navigation Links */}
            <div className="space-y-4 mt-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`block py-3 text-lg font-medium ${
                      isActive(item.path)
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="block py-3 text-gray-700 dark:text-gray-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block py-3 text-primary-600 font-medium dark:text-primary-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block py-3 text-gray-700 dark:text-gray-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block py-3 text-gray-700 dark:text-gray-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block py-3 text-gray-700 dark:text-gray-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    {user?.role === "admin" && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                        <Link
                          to="/admin"
                          className="block py-3 text-purple-600 font-medium dark:text-purple-400"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-3 text-red-600 dark:text-red-400"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Navbar;
