import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../store/slices/productSlice'

const useProducts = (initialFilters = {}) => {
  const dispatch = useDispatch()
  const { products, loading, totalPages, currentPage } = useSelector((state) => state.products)
  const [filters, setFilters] = useState(initialFilters)
  
  useEffect(() => {
    dispatch(fetchProducts(filters))
  }, [dispatch, filters])
  
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 })
  }
  
  const goToPage = (page) => {
    setFilters({ ...filters, page })
  }
  
  return {
    products,
    loading,
    totalPages,
    currentPage,
    filters,
    updateFilters,
    goToPage,
  }
}

export default useProducts