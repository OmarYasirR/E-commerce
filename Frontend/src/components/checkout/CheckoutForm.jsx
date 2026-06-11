import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "../common/Input";
import Button from "../common/Button";
import { useSelector } from "react-redux";
import OrderSummary from "./OrderSummary";

const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  address: yup.string().required("Address is required"),
  addressLine2: yup.string().optional(),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zipCode: yup.string().required("Zip code is required"),
  country: yup.string().required("Country is required"),
  shippingMethod: yup.string().required("Please select a shipping method"),
});

const CheckoutForm = ({ onSubmit, initialData = {}, loading = false }) => {
  const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    shippingMethod: "standard",
  };

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...defaultValues,
      ...(initialData || {}),
    },
  });

  const selectedShippingMethod = watch("shippingMethod");

  // Calculate shipping cost based on selected method
  const getShippingCost = (method) => {
    switch (method) {
      case "express":
        return 19.99;
      case "overnight":
        return 29.99;
      default:
        return 9.99;
    }
  };

  const shippingCost = getShippingCost(selectedShippingMethod);

  const {
      items,
      total,
      loading: cartLoading,
    } = useSelector((state) => state.cart);

  // Update parent component with shipping cost
  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      shippingCost,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Information Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            {...register("firstName")}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            {...register("lastName")}
            error={errors.lastName?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Phone Number"
            placeholder="+1 234 567 8900"
            {...register("phone")}
            error={errors.phone?.message}
          />
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Shipping Address
        </h3>
        <Input
          label="Street Address"
          placeholder="123 Main St"
          {...register("address")}
          error={errors.address?.message}
        />

        <div className="mt-4">
          <Input
            label="Address Line 2 (Optional)"
            placeholder="Apartment, suite, unit, etc."
            {...register("addressLine2")}
            error={errors.addressLine2?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="City"
            placeholder="New York"
            {...register("city")}
            error={errors.city?.message}
          />
          <Input
            label="State"
            placeholder="NY"
            {...register("state")}
            error={errors.state?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="ZIP Code"
            placeholder="10001"
            {...register("zipCode")}
            error={errors.zipCode?.message}
          />
          <Input
            label="Country"
            placeholder="United States"
            {...register("country")}
            error={errors.country?.message}
          />
        </div>
      </div>

      {/* Shipping Method Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Shipping Method
        </h3>
        <div className="space-y-3">
          <label
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
              selectedShippingMethod === "standard"
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                value="standard"
                {...register("shippingMethod")}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Standard Shipping
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Delivery in 5-7 business days
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Free tracking included
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 dark:text-white">$9.99</p>
            </div>
          </label>

          <label
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
              selectedShippingMethod === "express"
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                value="express"
                {...register("shippingMethod")}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Express Shipping
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Delivery in 2-3 business days
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Priority handling & tracking
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 dark:text-white">$19.99</p>
            </div>
          </label>

          <label
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
              selectedShippingMethod === "overnight"
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                value="overnight"
                {...register("shippingMethod")}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Overnight Shipping
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Delivery in 1 business day
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Express delivery & insurance
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 dark:text-white">$29.99</p>
            </div>
          </label>
        </div>
        {errors.shippingMethod && (
          <p className="text-red-500 text-sm mt-2">
            {errors.shippingMethod.message}
          </p>
        )}
      </div>

      <OrderSummary
        items={items}
        subtotal={items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        )}
        total={total}
      />

      <Button
        type="submit"
        isLoading={isSubmitting || loading}
        className="w-full"
      >
        Continue to Payment
      </Button>
    </form>
  );
};

export default CheckoutForm;
