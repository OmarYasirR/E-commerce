import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  IoPerson,
  IoMail,
  IoCall,
  IoCalendar,
  IoShieldOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoLocation,
  IoCart,
  IoHeart,
  IoStar,
  IoTime,
  IoCreate,
  IoTrash,
  IoBan,
  IoRefresh,
  IoLockClosed,
  IoCheckmark,
  IoClose,
  IoArrowBack,
} from 'react-icons/io5';
import { FaUserShield, FaUser, FaUserCheck, FaUserClock } from 'react-icons/fa';
import { showToast } from '../../components/common/Toast';
import adminService from '../../services/adminService';
import userService from '../../services/userService';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const UserDetails = ({ user, onUpdate, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'user');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(30);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await adminService.getUserStats(user._id);
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await userService.getUserOrders(1, 10);
      setUserOrders(response.data?.orders || []);
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  };

  const handleRoleChange = async () => {
    setLoading(true);
    try {
      await adminService.updateUserRole(user._id, selectedRole);
      showToast('success', `User role updated to ${selectedRole}`);
      setIsRoleModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    setLoading(true);
    try {
      await adminService.suspendUser(user._id, suspendReason, suspendDays);
      showToast('success', `User suspended for ${suspendDays} days`);
      setIsSuspendModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to suspend user');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async () => {
    setLoading(true);
    try {
      await adminService.activateUser(user._id);
      showToast('success', 'User activated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to activate user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: <FaUserShield size={14} /> },
      moderator: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <FaUserCheck size={14} /> },
      user: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <FaUser size={14} /> },
    };
    return badges[role] || badges.user;
  };

  const getStatusBadge = () => {
    const isSuspended = user?.lockUntil && new Date(user.lockUntil) > new Date();
    if (isSuspended) {
      return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', text: 'Suspended', icon: <IoBan size={14} /> };
    }
    return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', text: 'Active', icon: <IoCheckmarkCircle size={14} /> };
  };

  const statusBadge = getStatusBadge();
  const roleBadge = getRoleBadge(user?.role);
  const isSuspended = user?.lockUntil && new Date(user.lockUntil) > new Date();

  if (!user) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header with User Info */}
      <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=4f46e5&color=fff&size=100&bold=true`}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold dark:text-white">{user.name}</h2>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
              {roleBadge.icon}
              {user.role}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
              {statusBadge.icon}
              {statusBadge.text}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <IoMail size={14} />
              {user.email}
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-1">
                <IoCall size={14} />
                {user.phoneNumber}
              </div>
            )}
            <div className="flex items-center gap-1">
              <IoCalendar size={14} />
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
          {user.adminSince && (
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
              Admin since: {new Date(user.adminSince).toLocaleDateString()}
            </p>
          )}
          {isSuspended && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Suspended until: {new Date(user.lockUntil).toLocaleDateString()}
              {user.suspensionReason && ` - Reason: ${user.suspensionReason}`}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
        >
          <IoShieldOutline size={16} />
          Change Role
        </button>
        
        {isSuspended ? (
          <button
            onClick={handleActivateUser}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <IoRefresh size={16} />
            Activate User
          </button>
        ) : (
          <button
            onClick={() => setIsSuspendModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            <IoBan size={16} />
            Suspend User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            User Details
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 dark:text-white">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Full Name:</span>
                  <span className="dark:text-gray-300">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Email:</span>
                  <span className="dark:text-gray-300">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                  <span className="dark:text-gray-300">{user.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Email Verified:</span>
                  {user.isEmailVerified ? (
                    <span className="text-green-600 flex items-center gap-1"><IoCheckmarkCircle size={14} /> Yes</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1"><IoCloseCircle size={14} /> No</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 dark:text-white">Account Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">User ID:</span>
                  <span className="dark:text-gray-300 font-mono text-xs">{user._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Auth Provider:</span>
                  <span className="dark:text-gray-300">{user.authProvider || 'local'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                  <span className="dark:text-gray-300">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Login Attempts:</span>
                  <span className="dark:text-gray-300">{user.loginAttempts || 0}</span>
                </div>
              </div>
            </div>

            {user.preferences && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 md:col-span-2">
                <h3 className="font-semibold mb-3 dark:text-white">Preferences</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Newsletter:</span>
                    <p className="dark:text-gray-300">{user.preferences.newsletter ? 'Subscribed' : 'Not subscribed'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Notifications:</span>
                    <p className="dark:text-gray-300">{user.preferences.notifications ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Language:</span>
                    <p className="dark:text-gray-300">{user.preferences.language}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Currency:</span>
                    <p className="dark:text-gray-300">{user.preferences.currency}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <IoCart size={28} className="opacity-80" />
                <span className="text-2xl font-bold">{userStats.orders?.totalOrders || 0}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Total Orders</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <IoCash size={28} className="opacity-80" />
                <span className="text-2xl font-bold">${(userStats.orders?.totalSpent || 0).toFixed(2)}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Total Spent</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <IoHeart size={28} className="opacity-80" />
                <span className="text-2xl font-bold">{userStats.wishlist || 0}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Wishlist Items</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <IoStar size={28} className="opacity-80" />
                <span className="text-2xl font-bold">{userStats.reviews || 0}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Reviews Written</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {userOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <IoCart size={48} className="mx-auto mb-3 opacity-50" />
                <p>No orders found for this user</p>
              </div>
            ) : (
              userOrders.map((order) => (
                <div key={order._id} className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <p className="font-semibold dark:text-white">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600 dark:text-primary-400">${order.totalAmount?.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>{order.items?.length} item(s)</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change User Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select New Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRoleChange}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Suspend User Modal */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title="Suspend User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suspension Period (Days)
            </label>
            <input
              type="number"
              value={suspendDays}
              onChange={(e) => setSuspendDays(parseInt(e.target.value))}
              min="1"
              max="365"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows="3"
              placeholder="Enter reason for suspension..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsSuspendModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSuspendUser}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Suspending...' : 'Suspend User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetails;