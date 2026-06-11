import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  IoPerson, IoLocation, IoLockClosed, IoShieldOutline, 
  IoCart, IoHeart, IoLogOut, IoGrid, IoSettings, 
  IoStatsChart, IoPricetag, IoPeople, IoCube, 
  IoHome, IoReceipt, IoGift, IoStar, IoTime,
  IoChevronForward, IoChevronDown, IoNotifications,
  IoLanguage, IoHelpCircle, IoDocumentText,
  IoWallet, IoTrendingUp, IoBarChart, IoShareSocial,
  IoCloudUpload, IoTrash, IoCreate, IoCheckmarkCircle,
  IoMoonOutline, IoSunnyOutline
} from 'react-icons/io5';
import { FaUserShield, FaStore, FaTshirt, FaTruck, FaSun, FaMoon } from 'react-icons/fa';
import { MdDashboard, MdOutlineProductionQuantityLimits } from 'react-icons/md';
import { fetchProfile, updateProfile, changePassword, fetchAddresses, clearPasswordChangeSuccess } from '../store/slices/userSlice';
import { updateUser, logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/uiSlice';
import ProfileForm from '../components/user/ProfileForm';
import AddressForm from '../components/user/AddressForm';
import AddressList from '../components/user/AddressList';
import ChangePasswordForm from '../components/user/ChangePasswordForm';
import Loader from '../components/common/Loader';
import { showToast } from '../components/common/Toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, addresses, loading, passwordChangeSuccess } = useSelector((state) => state.user);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 24,
    totalSpent: 1250.00,
    wishlistItems: 8,
    memberSince: '2024-01-15'
  });

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
      dispatch(fetchAddresses());
    }
  }, [dispatch, isAuthenticated]);
  
  useEffect(() => {
    if (passwordChangeSuccess) {
      showToast('success', 'Password changed successfully');
      dispatch(clearPasswordChangeSuccess());
    }
  }, [dispatch, passwordChangeSuccess]);
  
  const handleUpdateProfile = async (data) => {
    try {
      const result = await dispatch(updateProfile(data)).unwrap();
      dispatch(updateUser(result));
      showToast('success', 'Profile updated successfully');
    } catch (error) {
      showToast('error', error || 'Failed to update profile');
    }
  };
  
  const handleChangePassword = async (data) => {
    try {
      await dispatch(changePassword(data)).unwrap();
    } catch (error) {
      showToast('error', error || 'Failed to change password');
    }
  };
  
  const handleLogout = async () => {
    await dispatch(logout());
    showToast('success', 'Logged out successfully');
    navigate('/');
  };
  
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    showToast('success', `${!isDarkMode ? 'Dark' : 'Light'} mode enabled`);
  };
  
  const navigateToAdminPage = (path) => {
    navigate(path);
    setIsAdminMenuOpen(false);
  };
  
  const userTabs = [
    { id: 'profile', label: 'Profile Information', icon: <IoPerson size={20} />, color: 'text-blue-500' },
    { id: 'addresses', label: 'Addresses', icon: <IoLocation size={20} />, color: 'text-green-500' },
    { id: 'password', label: 'Change Password', icon: <IoLockClosed size={20} />, color: 'text-red-500' },
  ];
  
  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: <MdDashboard size={20} />, description: 'View analytics and stats', color: 'from-purple-500 to-purple-600' },
    { path: '/admin/products', label: 'Products', icon: <MdOutlineProductionQuantityLimits size={20} />, description: 'Manage product catalog', color: 'from-blue-500 to-blue-600' },
    { path: '/admin/orders', label: 'Orders', icon: <IoReceipt size={20} />, description: 'View and manage orders', color: 'from-green-500 to-green-600' },
    { path: '/admin/users', label: 'Users', icon: <IoPeople size={20} />, description: 'Manage user accounts', color: 'from-yellow-500 to-yellow-600' },
    { path: '/admin/coupons', label: 'Coupons', icon: <IoGift size={20} />, description: 'Manage discount coupons', color: 'from-pink-500 to-pink-600' },
    { path: '/admin/reports', label: 'Reports', icon: <IoBarChart size={20} />, description: 'View sales reports', color: 'from-indigo-500 to-indigo-600' },
    { path: '/admin/management', label: 'Management', icon: <IoSettings size={20} />, description: 'Manage admin settings', color: 'from-gray-500 to-gray-600' }
  ];
  
  const quickLinks = [
    { path: '/orders', label: 'My Orders', icon: <IoReceipt size={18} />, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { path: '/wishlist', label: 'Wishlist', icon: <IoHeart size={18} />, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    { path: '/cart', label: 'Shopping Cart', icon: <IoCart size={18} />, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { path: '/returns', label: 'Returns', icon: <IoTime size={18} />, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  ];
  
  if (loading && !profile) return <Loader />;
  
  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';
  const userName = user?.name || profile?.name || 'User';
  const userEmail = user?.email || profile?.email;
  const avatarUrl = user?.avatar || profile?.avatar || `https://ui-avatars.com/api/?name=${userName}&background=4f46e5&color=fff&size=128&bold=true&length=2`;
  
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  const staggerChildren = {
    animate: { transition: { staggerChildren: 0.1 } }
  };
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="container-custom py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl sticky top-24 overflow-hidden`}>
              {/* User Info Card with Cover Photo */}
              <div className="relative">
                <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-700"></div>
                <div className="text-center px-6 pb-6 relative">
                  <div className="relative inline-block">
                    <img 
                      src={avatarUrl}
                      alt={userName}
                      className="w-28 h-28 rounded-full mx-auto -mt-14 border-4 border-white dark:border-gray-800 shadow-lg object-cover"
                    />
                  </div>
                  <h3 className={`font-bold text-xl mt-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {userName}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userEmail}
                  </p>
                  
                  {/* Member Badge */}
                  <div className="flex justify-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                      <IoStar size={12} />
                      Member since {new Date(stats.memberSince).getFullYear()}
                    </span>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                        <FaUserShield size={12} />
                        Administrator
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* User Stats Cards */}
              <div className={`grid grid-cols-3 gap-3 px-4 py-4 border-t border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.totalOrders}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">${stats.totalSpent}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.wishlistItems}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Wishlist</div>
                </div>
              </div>
              
              {/* User Navigation Tabs */}
              <nav className="p-4 space-y-2">
                {userTabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between group transition-all duration-300 rounded-xl ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 font-medium shadow-sm'
                        : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`
                    }`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className={`${activeTab === tab.id ? tab.color : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500'} transition`}>
                        {tab.icon}
                      </div>
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    {activeTab === tab.id && <IoChevronForward className="mr-4 text-primary-500" size={16} />}
                  </motion.button>
                ))}
                
                <div className="my-3"></div>
                
                {/* Quick Links */}
                {quickLinks.map((link, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(link.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`${link.color}`}>{link.icon}</div>
                    <span className="text-sm">{link.label}</span>
                  </motion.button>
                ))}
                
                {/* Admin Section */}
                {isAdmin && (
                  <>
                    <div className="my-3">
                      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                    </div>
                    
                    <motion.div 
                      initial={false}
                      className="rounded-xl overflow-hidden"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <FaUserShield size={18} />
                          <span className="text-sm">Admin Panel</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isAdminMenuOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <IoChevronDown size={16} />
                        </motion.div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {isAdminMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-1 px-2 pb-3"
                          >
                            {adminLinks.map((link) => (
                              <motion.button
                                key={link.path}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigateToAdminPage(link.path)}
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group"
                              >
                                <div className="text-purple-500 dark:text-purple-400">{link.icon}</div>
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium">{link.label}</div>
                                  <div className="text-xs text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition">
                                    {link.description}
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </>
                )}
                
                <div className="my-3">
                  <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                </div>
                
                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleTheme}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isDarkMode ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
                  <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </motion.button>
                
                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <IoLogOut size={18} />
                  <span className="text-sm">Logout</span>
                </motion.button>
              </nav>
            </div>
          </motion.div>
          
          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Welcome Banner */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-6`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Welcome back, {userName.split(' ')[0]}!
                  </h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    Here's what's happening with your account today.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className={`p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition`}>
                    <IoNotifications size={20} />
                  </button>
                  <button className={`p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition`}>
                    <IoHelpCircle size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Admin Dashboard Preview */}
            {isAdmin && activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <FaUserShield size={28} />
                    <h2 className="text-xl font-bold">Admin Dashboard Overview</h2>
                  </div>
                  <p className="text-purple-100 mb-4">
                    You have full access to manage your store. Quick actions available below.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => navigate('/admin')}
                      className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2"
                    >
                      <IoStatsChart size={18} />
                      View Full Dashboard →
                    </button>
                    <button
                      onClick={() => navigate('/admin/products/new')}
                      className="bg-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-800 transition flex items-center gap-2"
                    >
                      <IoCloudUpload size={18} />
                      Add New Product
                    </button>
                  </div>
                </div>
                
                <motion.div 
                  variants={staggerChildren}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {adminLinks.map((link, idx) => (
                    <motion.button
                      key={idx}
                      variants={fadeInUp}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      onClick={() => navigateToAdminPage(link.path)}
                      className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-left group`}
                    >
                      <div className={`bg-gradient-to-r ${link.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                        <div className="text-white text-xl">{link.icon}</div>
                      </div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
                        {link.label}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {link.description}
                      </p>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
            
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}
              >
                {activeTab === 'profile' && (
                  <>
                    <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <IoPerson size={24} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          Profile Information
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Update your personal information and preferences
                        </p>
                      </div>
                    </div>
                    <ProfileForm initialData={profile || user} onSubmit={handleUpdateProfile} loading={loading} />
                  </>
                )}
                
                {activeTab === 'addresses' && (
                  <>
                    <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                        <IoLocation size={24} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          My Addresses
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Manage your shipping and billing addresses
                        </p>
                      </div>
                    </div>
                    <AddressForm onSuccess={() => dispatch(fetchAddresses())} />
                    <div className="mt-8">
                      <AddressList addresses={addresses} onRefresh={() => dispatch(fetchAddresses())} />
                    </div>
                  </>
                )}
                
                {activeTab === 'password' && (
                  <>
                    <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                        <IoLockClosed size={24} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          Change Password
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Ensure your account is using a strong password
                        </p>
                      </div>
                    </div>
                    <ChangePasswordForm onSubmit={handleChangePassword} />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;