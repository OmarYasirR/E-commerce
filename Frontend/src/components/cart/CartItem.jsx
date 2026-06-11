import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCartItem, removeFromCart } from "../../store/slices/cartSlice";
import { IoTrash, IoAdd, IoRemove, IoWarning } from "react-icons/io5";
import { showToast } from "../common/Toast";
import Modal from "../../components/common/Modal";
import { useEffect } from "react";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { updating, currentProduct, isDeleting } = useSelector((state) => state.cart);

  const handleQuantityChange = useCallback(
    async (newQuantity) => {
      if (newQuantity < 1) return;

      setQuantity(newQuantity);

      try {
        await dispatch(
          updateCartItem({
            productId: item.productId,
            quantity: newQuantity,
            variant: item.variant,
          }),
        ).unwrap();
      } catch (error) {
        // Revert on error
        setQuantity(item.quantity);
        showToast("error", "Failed to update quantity");
      } finally {
      }
    },
    [dispatch, item.productId, item.quantity, item.variant],
  );

  const handleRemove = async () => {
    console.log("Removing item:", item);
    try {
      setDeleting(true);
      await dispatch(
        removeFromCart({
          productId: item.productId,
          variant: item.variant,
        }),
      ).unwrap();
      setDeleting(false);
      setIsOpen(false);
      showToast("success", "Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      showToast("error", "Failed to remove item");
    }
  }

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      {/* remove item modal */}
      <Modal
        isOpen={isOpen}
        isloading={deleting}
        onClose={() => setIsOpen(false)}
        confirmText="Remove"
        title="Remove Item"
        footerContent="Are you sure you want to remove this item from your cart?"
        onConfirm={handleRemove}
        isLoading={isDeleting}
      >
        <div className="space-y-4">
          {/* Warning Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <IoWarning size={32} className="text-red-500" />
            </div>
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Are you sure you want to remove{" "}
            <span className="font-semibold">
              {item.name || item.product?.name}
            </span>{" "}
            from your cart?
          </p>

          {/* actions buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleRemove}
              disabled={isDeleting}
              className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </Modal>
      <img
        src={
          item.image ||
          item.product?.images?.[0]?.url ||
          "https://via.placeholder.com/80"
        }
        alt={item.name || item.product?.name}
        className="w-20 h-20 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{item.name || item.product?.name}</h3>
        <p className="text-gray-600 text-sm">${item.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={
            quantity <= 1 || (updating && ((  currentProduct === item.productId) || isDeleting))
          }
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          <IoRemove size={18} />
        </button>
        <span className="w-12 text-center font-medium">
          {updating && currentProduct === item.productId ? "..." : quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={updating && ( currentProduct === item.productId) || isDeleting}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          <IoAdd size={18} />
        </button>
      </div>

      <div className="text-right">
        <p className="font-semibold">${(item.price * quantity).toFixed(2)}</p>
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-red-500 hover:text-red-700 mt-1"
          disabled={
            (updating && currentProduct === item.productId) || deleting
          }
        >
          <IoTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
