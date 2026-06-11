import React, { useState, useEffect } from 'react';
import { 
  IoAdd, IoSearch, IoTrash, IoCreate, IoCopy, 
  IoCalendar, IoCash 
} from 'react-icons/io5';
import { PiPercent } from 'react-icons/pi';
import adminService from '../../services/adminService';
import couponService from '../../services/couponService';
import { showToast } from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import CouponForm from './CouponForm';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchCoupons();
    fetchCouponStats();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllCoupons({
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      });
      setCoupons(response.data.coupons);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      showToast('error', error.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data.coupons);
    } catch (error) {
      console.error('Failed to fetch coupon stats', error);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await adminService.deleteCoupon(couponId);
        showToast('success', 'Coupon deleted successfully');
        fetchCoupons();
      } catch (error) {
        showToast('error', error.message || 'Failed to delete coupon');
      }
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      await adminService.toggleCouponStatus(couponId);
      showToast('success', 'Coupon status updated');
      fetchCoupons();
    } catch (error) {
      showToast('error', error.message || 'Failed to update coupon status');
    }
  };

  const handleDuplicateCoupon = async (coupon) => {
    const newCode = `${coupon.code}_COPY`;
    try {
      await couponService.duplicateCoupon(coupon._id, newCode);
      showToast('success', 'Coupon duplicated successfully');
      fetchCoupons();
    } catch (error) {
      showToast('error', error.message || 'Failed to duplicate coupon');
    }
  };

  const getStatusBadge = (status, isActive) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      disabled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDiscountTypeIcon = (type) => {
    return type === 'percentage' ? <PiPercent size={16} /> : <IoCash size={16} />;
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-gray-600">Manage discount coupons and promotions</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          <IoAdd /> Create Coupon
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Total Coupons</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Active Coupons</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Expired</p>
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Total Usage</p>
            <p className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + c.usageCount, 0)}</p>
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
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getDiscountTypeIcon(coupon.discountType)}
                      <h3 className="text-xl font-bold">{coupon.code}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{coupon.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(coupon.status, coupon.isActive)}`}>
                    {coupon.isActive ? coupon.status : 'Disabled'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary-600">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                  </p>
                  {coupon.minimumOrderAmount > 0 && (
                    <p className="text-sm text-gray-500">Min. order: ${coupon.minimumOrderAmount}</p>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <IoCalendar size={14} />
                    <span>
                      {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PiPercent size={14} />
                    <span>Used: {coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                  </div>
                  {isExpired(coupon.endDate) && (
                    <p className="text-red-500 text-xs">Expired</p>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      setEditingCoupon(coupon);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <IoCreate size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDuplicateCoupon(coupon)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <IoCopy size={16} /> Duplicate
                  </button>
                  <button
                    onClick={() => handleToggleStatus(coupon._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    {coupon.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    className="px-3 py-2 border rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <IoTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Coupon Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
        }}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        size="large"
      >
        <CouponForm
          coupon={editingCoupon}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCoupons();
            fetchCouponStats();
          }}
        />
      </Modal>
    </div>
  );
};

export default AdminCoupons;