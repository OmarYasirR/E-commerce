import React, { useState, useEffect } from 'react';
import { 
  IoSearch, IoTrash, IoCreate, IoBan, IoRefresh, 
  IoMail, IoCall, IoCalendar 
} from 'react-icons/io5';
import adminService from '../../services/adminService';
import userService from '../../services/userService';
import { showToast } from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import UserDetails from './UserDetails';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [currentPage, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers({
        page: currentPage,
        limit: 20,
        role: roleFilter || undefined,
        search: searchTerm || undefined
      });
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      showToast('error', error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data.users);
    } catch (error) {
      console.error('Failed to fetch user stats', error);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      try {
        await adminService.suspendUser(userId, 'Violation of terms', 30);
        showToast('success', 'User suspended successfully');
        fetchUsers();
      } catch (error) {
        showToast('error', error.message || 'Failed to suspend user');
      }
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminService.activateUser(userId);
      showToast('success', 'User activated successfully');
      fetchUsers();
    } catch (error) {
      showToast('error', error.message || 'Failed to activate user');
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await adminService.updateUserRole(userId, role);
      showToast('success', 'User role updated');
      fetchUsers();
    } catch (error) {
      showToast('error', error.message || 'Failed to update role');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-gray-600">Manage customer accounts and permissions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">New This Month</p>
            <p className="text-2xl font-bold">{stats.newThisMonth}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Active Today</p>
            <p className="text-2xl font-bold">{stats.newToday}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Admins</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('');
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <IoMail size={14} className="text-gray-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.phoneNumber ? (
                        <div className="flex items-center gap-1">
                          <IoCall size={14} className="text-gray-400" />
                          <span className="text-sm">{user.phoneNumber}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <IoCalendar size={14} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.lockUntil && user.lockUntil > new Date() ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="View Details"
                        >
                          <IoCreate size={18} />
                        </button>
                        {user.lockUntil && user.lockUntil > new Date() ? (
                          <button
                            onClick={() => handleActivateUser(user._id)}
                            className="text-green-500 hover:text-green-700"
                            title="Activate User"
                          >
                            <IoRefresh size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendUser(user._id)}
                            className="text-orange-500 hover:text-orange-700"
                            title="Suspend User"
                          >
                            <IoBan size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title={`User Details - ${selectedUser?.name}`}
        size="large"
      >
        <UserDetails user={selectedUser} onUpdate={fetchUsers} />
      </Modal>
    </div>
  );
};

export default AdminUsers;