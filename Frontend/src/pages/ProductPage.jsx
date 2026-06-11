import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, fetchRelatedProducts, clearCurrentProduct } from '../store/slices/productSlice';
import { fetchProductReviews, fetchReviewStats } from '../store/slices/reviewSlice';
import ProductDetails from '../components/products/ProductDetails';
import ProductReviews from '../components/products/ProductReviews';
import RelatedProducts from '../components/products/RelatedProducts';
import Loader from '../components/common/Loader';

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, relatedProducts, loading } = useSelector((state) => state.products);
  const { reviews, reviewStats } = useSelector((state) => state.reviews);
  
  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchRelatedProducts({ productId: id, limit: 4 }));
    dispatch(fetchProductReviews({ productId: id, page: 1, limit: 10 }));
    dispatch(fetchReviewStats(id));
    
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  
  if (loading) return <Loader fullScreen />;
  
  if (!currentProduct) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-8">
      <ProductDetails product={currentProduct} />
      
      <ProductReviews 
        productId={id} 
        reviews={reviews[id]?.reviews || []}
        stats={reviewStats[id]}
        loading={loading}
      />
      
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
};

export default ProductPage;