import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  IoLocation, IoCreate, IoTrash, IoStar, IoStarOutline,
  IoHome, IoBusiness, IoCheckmarkCircle 
} from 'react-icons/io5';
import { showToast } from '../common/Toast';
import { deleteAddress, setDefaultAddress, fetchAddresses } from '../../store/slices/userSlice';
import Modal from '../common/Modal';
import AddressForm from './AddressForm';

const AddressList = ({ addresses, onRefresh, loading = false }) => {
  const dispatch = useDispatch();
  const [editingAddress, setEditingAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setDeletingId(addressId);
      try {
        await dispatch(deleteAddress(addressId)).unwrap();
        showToast('success', 'Address deleted successfully');
        if (onRefresh) onRefresh();
        else dispatch(fetchAddresses());
      } catch (error) {
        showToast('error', error || 'Failed to delete address');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await dispatch(setDefaultAddress(addressId)).unwrap();
      showToast('success', 'Default address updated');
      if (onRefresh) onRefresh();
      else dispatch(fetchAddresses());
    } catch (error) {
      showToast('error', error || 'Failed to set default address');
    }
  };

  const getAddressTypeIcon = (type) => {
    switch(type) {
      case 'shipping':
        return <IoHome className="text-blue-500" size={18} />;
      case 'billing':
        return <IoBusiness className="text-purple-500" size={18} />;
      default:
        return <IoLocation className="text-green-500" size={18} />;
    }
  };

  const getAddressTypeText = (type) => {
    switch(type) {
      case 'shipping':
        return 'Shipping Address';
      case 'billing':
        return 'Billing Address';
      default:
        return 'Shipping & Billing';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <IoLocation size={48} className="text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">No addresses saved yet</p>
        <button
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Add your first address →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <button
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          + Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div
            key={address._id}
            className={`border rounded-lg p-4 transition-all ${
              address.isDefault ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {getAddressTypeIcon(address.addressType)}
                <span className="text-sm font-medium text-gray-600">
                  {getAddressTypeText(address.addressType)}
                </span>
              </div>
              {address.isDefault && (
                <span className="flex items-center gap-1 text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                  <IoCheckmarkCircle size={12} />
                  Default
                </span>
              )}
            </div>

            <div className="mb-3">
              <p className="font-semibold text-gray-900">{address.fullName}</p>
              <p className="text-gray-600 text-sm">{address.addressLine1}</p>
              {address.addressLine2 && (
                <p className="text-gray-600 text-sm">{address.addressLine2}</p>
              )}
              <p className="text-gray-600 text-sm">
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p className="text-gray-600 text-sm">{address.country}</p>
              {address.phone && (
                <p className="text-gray-500 text-xs mt-1">Phone: {address.phone}</p>
              )}
              {address.email && (
                <p className="text-gray-500 text-xs">Email: {address.email}</p>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t">
              <button
                onClick={() => {
                  setEditingAddress(address);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <IoCreate size={16} /> Edit
              </button>
              
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address._id)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                >
                  <IoStarOutline size={16} /> Set Default
                </button>
              )}
              
              <button
                onClick={() => handleDelete(address._id)}
                disabled={deletingId === address._id}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deletingId === address._id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <IoTrash size={16} />
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
        size="large"
      >
        <AddressForm
          address={editingAddress}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingAddress(null);
            if (onRefresh) onRefresh();
            else dispatch(fetchAddresses());
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingAddress(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default AddressList;