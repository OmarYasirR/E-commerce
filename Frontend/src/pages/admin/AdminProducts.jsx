import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  IoAdd, IoSearch, IoFilter, IoTrash, IoCreate, 
  IoEye, IoChevronDown, IoDownload 
} from 'react-icons/io5';
import adminService from '../../services/adminService';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { showToast } from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import ProductForm from './ProductForm';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  // useEffect(() => {
  //   fetchProducts();
  //   fetchCategories();
  // }, [currentPage, statusFilter, categoryFilter, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllProducts({
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: searchTerm || undefined
      });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      showToast('error', error.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getCategories({ includeProducts: true });
        console.log('Fetched categories:', response); 
        setCategories(response);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        showToast('error', 'Failed to fetch categories');
      } finally {   
        setLoading(false);
      }
    };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(productId);
        showToast('success', 'Product deleted successfully');
        fetchProducts();
      } catch (error) {
        showToast('error', error.message || 'Failed to delete product');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
      try {
        await adminService.bulkDeleteProducts(selectedProducts);
        showToast('success', `${selectedProducts.length} products deleted`);
        setSelectedProducts([]);
        fetchProducts();
      } catch (error) {
        showToast('error', error.message || 'Failed to delete products');
      }
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedProducts.length === 0) return;
    try {
      await adminService.bulkUpdateProducts(selectedProducts, { status });
      showToast('success', `${selectedProducts.length} products updated`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      showToast('error', error.message || 'Failed to update products');
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminService.exportProducts();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('success', 'Products exported successfully');
    } catch (error) {
      showToast('error', 'Failed to export products');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <IoDownload /> Export
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <IoAdd /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
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
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCategoryFilter('');
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span>{selectedProducts.length} products selected</span>
          <div className="flex gap-2">
            <select
              onChange={(e) => handleBulkStatusUpdate(e.target.value)}
              className="px-3 py-1 border rounded"
            >
              <option value="">Change Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(products.map(p => p._id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">SKU</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product._id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.sku || '-'}</td>
                    <td className="px-4 py-3 font-semibold">${product.price}</td>
                    <td className="px-4 py-3">
                      <span className={product.quantity < 10 ? 'text-red-500 font-semibold' : 'text-gray-600'}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`/product/${product._id}`, '_blank')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <IoEye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="text-green-500 hover:text-green-700"
                        >
                          <IoCreate size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <IoTrash size={18} />
                        </button>
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

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="large"
      >
        <ProductForm
          product={editingProduct}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProducts();
          }}
        />
      </Modal>
    </div>
  );
};

export default AdminProducts;