// backend/scripts/cleanupCarts.js
const mongoose = require('mongoose');
const Cart = require('../src/models/Cart.model');
require('dotenv').config();

const cleanupCarts = async () => {
  try {
    const options = {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName: process.env.DB_NAME || 'ecommerce'
    };
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ Connected to MongoDB\n');

    // Find all carts
    const carts = await Cart.find({});
    console.log(`Found ${carts.length} carts\n`);

    let cleaned = 0;
    let removed = 0;

    for (const cart of carts) {
      let modified = false;
      
      // Filter out invalid items
      const validItems = cart.items.filter(item => {
        const isValid = item.productId && 
                       item.product && 
                       item.product.name && 
                       item.product.price !== undefined;
        
        if (!isValid) {
          console.log(`  Removing invalid item from cart ${cart._id}`);
        }
        return isValid;
      });
      
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        modified = true;
        cleaned++;
      }
      
      // Recalculate totals if modified
      if (modified) {
        await cart.calculateTotals();
        console.log(`  Cleaned cart ${cart._id}: ${cart.items.length} valid items`);
        removed += (cart.items.length - validItems.length);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 Cleanup Summary:');
    console.log(`   🧹 Cleaned carts: ${cleaned}`);
    console.log(`   🗑️  Removed invalid items: ${removed}`);
    console.log('═'.repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupCarts();