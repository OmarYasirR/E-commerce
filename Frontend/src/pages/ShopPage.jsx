import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, setProductFilters, resetProductFilters } from '../store/slices/productSlice';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import Loader from '../components/common/Loader';

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, pagination, filters } = useSelector((state) => state.products);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  
  useEffect(() => {
    const queryFilters = {
      page: currentPage,
      limit: 12,
      category: searchParams.get('category'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      rating: searchParams.get('rating'),
      search: searchParams.get('search'),
      sort: searchParams.get('sort') || '-createdAt',
    };
    
    // Remove undefined values
    Object.keys(queryFilters).forEach(key => {
      if (queryFilters[key] === null || queryFilters[key] === undefined) {
        delete queryFilters[key];
      }
    });
    
    dispatch(fetchProducts(queryFilters));
  }, [dispatch, currentPage, searchParams]);
  
  const handleFilterChange = (newFilters) => {
    // Update URL params
    const params = {};
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.minPrice) params.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice) params.maxPrice = newFilters.maxPrice;
    if (newFilters.rating) params.rating = newFilters.rating;
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.sort) params.sort = newFilters.sort;
    
    setSearchParams(params);
    setCurrentPage(1);
    dispatch(setProductFilters(newFilters));
  };
  
  const handleResetFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
    dispatch(resetProductFilters());
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams({ ...Object.fromEntries(searchParams), page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64 flex-shrink-0">
          <ProductFilters 
            onFilterChange={handleFilterChange} 
            onReset={handleResetFilters}
            currentFilters={filters}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Products</h1>
            <p className="text-gray-600">
              Showing {products.length} of {pagination.total} products
            </p>
          </div>
          
          {loading ? <Loader /> : <ProductGrid products={products} />}
          
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;