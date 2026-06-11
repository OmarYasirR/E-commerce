const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [200, 'Address line 1 cannot exceed 200 characters']
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address line 2 cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    match: [/^[A-Za-z0-9\s-]{3,10}$/, 'Please enter a valid postal code']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'USA'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  addressType: {
    type: String,
    enum: ['shipping', 'billing', 'both'],
    default: 'both'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: [100, 'Landmark cannot exceed 100 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
  },
  latitude: {
    type: Number,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ user: 1, isDeleted: 1 });
addressSchema.index({ city: 1, state: 1, country: 1 });

// Ensure only one default address per user and type
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    const Address = mongoose.model('Address');
    
    // Remove default from other addresses of same type
    await Address.updateMany(
      { 
        user: this.user, 
        addressType: this.addressType,
        _id: { $ne: this._id }
      },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Soft delete method
addressSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  
  // If this was default, set another address as default
  if (this.isDefault) {
    const Address = mongoose.model('Address');
    const anotherAddress = await Address.findOne({
      user: this.user,
      _id: { $ne: this._id },
      isDeleted: false
    });
    
    if (anotherAddress) {
      anotherAddress.isDefault = true;
      await anotherAddress.save();
    }
  }
  
  await this.save();
  return this;
};

// Get formatted address
addressSchema.methods.getFormattedAddress = function() {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.postalCode,
    this.country
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
};

module.exports = mongoose.model('Address', addressSchema);