import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoSearch, IoShieldOutline, IoPersonOutline, IoTime, IoTrash, IoCheckmark } from 'react-icons/io5';
import { showToast } from '../common/Toast';
import api from '../../services/api';
import Loader from '../common/Loader';

const AdminManagement = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAdmins();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Failed to fetch admins', error);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/make-admin`, {
        role: 'admin',
        permissions: ['manage_users', 'manage_products', 'manage_orders', 'manage_coupons']
      });
      showToast('success', 'Admin role granted successfully');
      fetchUsers();
      fetchAdmins();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to grant admin role');
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (userId === currentUser._id) {
      showToast('error', 'You cannot remove your own admin privileges');
      return;
    }
    
    if (window.confirm('Are you sure you want to remove admin privileges from this user?')) {
      try {
        await api.post(`/admin/users/${userId}/remove-admin`);
        showToast('success', 'Admin role revoked successfully');
        fetchUsers();
        fetchAdmins();
      } catch (error) {
        showToast('error', error.response?.data?.message || 'Failed to revoke admin role');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nonAdminUsers = filteredUsers.filter(user => user.role !== 'admin');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <p className="text-gray-600">Manage administrator privileges for users</p>
      </div>

      {/* Current Admins Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <IoShieldOutline size={24} className="text-purple-600" />
          <h2 className="text-xl font-semibold">Current Administrators</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <div key={admin._id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={admin.avatar || `https://ui-avatars.com/api/?name=${admin.name}&background=4f46e5&color=fff`}
                  alt={admin.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{admin.name}</p>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Admin since: {new Date(admin.adminSince).toLocaleDateString()}
                </div>
                {admin._id !== currentUser._id && (
                  <button
                    onClick={() => handleRemoveAdmin(admin._id)}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <IoTrash size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grant Admin Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <IoPersonOutline size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Grant Admin Privileges</h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        {/* Users List */}
        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-3">
            {nonAdminUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=4f46e5&color=fff`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleMakeAdmin(user._id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <IoShieldOutline size={16} />
                  Make Admin
                </button>
              </div>
            ))}
            
            {nonAdminUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found to grant admin privileges
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement; 