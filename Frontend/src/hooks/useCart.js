import { useSelector, useDispatch } from 'react-redux'
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice'

const useCart = () => {
  const dispatch = useDispatch()
  const { items, totalAmount } = useSelector((state) => state.cart)
  
  const addItem = (product, quantity = 1) => {
    dispatch(addToCart({ ...product, quantity }))
  }
  
  const removeItem = (productId) => {
    dispatch(removeFromCart(productId))
  }
  
  const updateItemQuantity = (productId, quantity) => {
    dispatch(updateQuantity({ id: productId, quantity }))
  }
  
  const clearCartItems = () => {
    dispatch(clearCart())
  }
  
  return {
    items,
    totalAmount,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart: clearCartItems,
  }
}

export default useCart