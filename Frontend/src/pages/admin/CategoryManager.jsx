import React, { useState, useEffect } from 'react';
import {
  IoAdd,
  IoCreate,
  IoTrash,
  IoFolderOpen,
  IoChevronDown,
  IoChevronForward,
  IoWarning,
  IoClose,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import { showToast } from '../../components/common/Toast';
import categoryService from '../../services/categoryService';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [moveProductsTo, setMoveProductsTo] = useState('');
  const [deleteOptions, setDeleteOptions] = useState({
    action: 'delete', // 'delete' or 'move'
    targetCategory: ''
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    orderIndex: 0,
    status: 'active',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories({ includeProducts: true });
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showToast('error', 'Failed to fetch categories');
    } finally {   
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      errors.name = 'Category name cannot exceed 50 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        orderIndex: Number(formData.orderIndex) || 0,
        status: formData.status
      };
      
      if (formData.parent && formData.parent !== '' && formData.parent !== 'null') {
        payload.parent = formData.parent;
      } else {
        payload.parent = null;
      }
      
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, payload);
        showToast('success', 'Category updated successfully');
      } else {
        await categoryService.createCategory(payload);
        showToast('success', 'Category created successfully');
      }
      
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        parent: '',
        orderIndex: 0,
        status: 'active',
      });
      setFormErrors({});
      await fetchCategories();
      
    } catch (error) {
      console.error('Operation failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Operation failed';
      showToast('error', errorMessage);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteOptions({
      action: 'delete',
      targetCategory: ''
    });
    setMoveProductsTo('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsSubmitting(true);
    try {
      if (deleteOptions.action === 'move' && deleteOptions.targetCategory) {
        await categoryService.deleteCategory(categoryToDelete._id, deleteOptions.targetCategory);
        showToast('success', `Category "${categoryToDelete.name}" deleted and products moved successfully`);
      } else {
        await categoryService.deleteCategory(categoryToDelete._id);
        showToast('success', `Category "${categoryToDelete.name}" deleted successfully`);
      }
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('error', error.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent: category.parent?._id || category.parent || '',
      orderIndex: category.orderIndex || 0,
      status: category.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const toggleExpand = (categoryId) => {
    console.log('Toggling expand for category:', categoryId);
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    console.log(newExpanded);
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (categoriesList, level = 0) => {
    return categoriesList.map((category) => (
      <div key={category._id}>
        <div 
          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          style={{ marginLeft: level * 24 }}
        >
          <div className="flex items-center gap-3 flex-1">
            {category.children && category.children.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(category._id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                {expandedCategories.has(category._id) ? (
                  <IoChevronDown size={16} />
                ) : (
                  <IoChevronForward size={16} />
                )}
              </button>
            )}
            <IoFolderOpen className="text-yellow-500 text-3xl" />
            <div>
              <p className="font-medium dark:text-white">{category.name}</p>
              {category.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              category.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {category.status}
            </span>
            <button
              type="button"
              onClick={() => handleEdit(category)}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
              title="Edit"
            >
              <IoCreate size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteClick(category)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
              title="Delete"
            >
              <IoTrash size={18} />
            </button>
          </div>
        </div>
        {expandedCategories.has(category._id) && category.children && category.children.length > 0 && (
          <div>
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const getParentOptions = () => {
    const filterCategories = (cats) => {
      if (!editingCategory) return cats;
      
      const filterOutCurrent = (categoryList) => {
        return categoryList
          .filter(cat => cat._id !== editingCategory._id)
          .map(cat => ({
            ...cat,
            children: cat.children ? filterOutCurrent(cat.children) : []
          }));
      };
      
      return filterOutCurrent(cats);
    };
    
    const availableCategories = editingCategory ? filterCategories(categories) : categories;
    
    // Get all categories except the one being deleted
    const getAvailableForMove = (cats, excludeId) => {
      const options = [];
      for (const cat of cats) {
        if (cat._id !== excludeId) {
          options.push(cat);
          if (cat.children) {
            options.push(...getAvailableForMove(cat.children, excludeId));
          }
        }
      }
      return options;
    };
    
    const renderOptions = (cats, level = 0) => {
      let options = [];
      for (const cat of cats) {
        options.push(
          <option key={cat._id} value={cat._id}>
            {'—'.repeat(level)} {cat.name}
          </option>
        );
        if (cat.children && cat.children.length > 0) {
          options.push(...renderOptions(cat.children, level + 1));
        }
      }
      return options;
    };
    
    const moveOptions = categoryToDelete 
      ? getAvailableForMove(categories, categoryToDelete._id)
      : categories;
    
    if (deleteOptions.action === 'move') {
      return (
        <select
          value={deleteOptions.targetCategory}
          onChange={(e) => setDeleteOptions({ ...deleteOptions, targetCategory: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
          required
        >
          <option value="">Select a category</option>
          {renderOptions(moveOptions)}
        </select>
      );
    }
    
    return renderOptions(availableCategories);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Category Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Organize your products with categories</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              description: '',
              parent: '',
              orderIndex: 0,
              status: 'active',
            });
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <IoAdd size={18} />
          Add Category
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <IoFolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No categories found</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Create your first category →
              </button>
            </div>
          ) : (
            renderCategoryTree(categories)
          )}
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          setFormErrors({});
        }}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: null });
              }}
              placeholder="e.g., Electronics"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description) setFormErrors({ ...formErrors, description: null });
              }}
              rows="3"
              placeholder="Brief description of the category (max 500 characters)"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 ${
                formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent Category
            </label>
            <select
              value={formData.parent}
              onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">None (Top Level)</option>
              {getParentOptions()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={formData.orderIndex}
              onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCategory(null);
                setFormErrors({});
              }}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')} Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
          setDeleteOptions({ action: 'delete', targetCategory: '' });
        }}
        title="Delete Category"
        size="medium"
      >
        <div className="space-y-4">
          {/* Warning Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <IoWarning size={32} className="text-red-500" />
            </div>
          </div>
          
          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete "{categoryToDelete?.name}"?
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This action cannot be undone. This category may contain products.
            </p>
          </div>
          
          {/* Options */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What would you like to do with the products?
            </label>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="deleteAction"
                  value="delete"
                  checked={deleteOptions.action === 'delete'}
                  onChange={() => setDeleteOptions({ action: 'delete', targetCategory: '' })}
                  className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Delete all products</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This will permanently delete all products in this category
                  </p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="deleteAction"
                  value="move"
                  checked={deleteOptions.action === 'move'}
                  onChange={() => setDeleteOptions({ action: 'move', targetCategory: '' })}
                  className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Move products to another category</p>
                  <div className="mt-2">
                    <select
                      value={deleteOptions.targetCategory}
                      onChange={(e) => setDeleteOptions({ ...deleteOptions, targetCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
                      disabled={deleteOptions.action !== 'move'}
                    >
                      <option value="">Select destination category</option>
                      {categories.length> 0 && categories.filter(cat => cat._id !== categoryToDelete?._id).map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      )) }
                    </select>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          {/* Warning for move option */}
          {deleteOptions.action === 'move' && !deleteOptions.targetCategory && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-1">
                <IoWarning size={16} className="inline mr-1 text-yellow-500" /> 
                Please select a destination category for the products.
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
              }}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isSubmitting || (deleteOptions.action === 'move' && !deleteOptions.targetCategory)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <IoTrash size={16} />
                  Delete Category
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManager;