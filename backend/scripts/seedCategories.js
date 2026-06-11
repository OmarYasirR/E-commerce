// backend/scripts/seedCategories.js
const mongoose = require('mongoose');
const Category = require('../src/models/Category.model');
require('dotenv').config();

const categories = [
  // Level 1 Categories
  {
    name: 'Electronics',
    description: 'Cutting-edge technology and gadgets for modern living. From smartphones and laptops to headphones and smart home devices, explore the latest in consumer electronics with premium quality and warranty.',
    level: 0,
    orderIndex: 1,
    status: 'active'
  },
  {
    name: 'Clothing & Fashion',
    description: 'Stay stylish with our curated collection of men\'s, women\'s, and kids\' fashion. From casual wear to formal attire, activewear to accessories, find clothing that expresses your unique style with comfort and quality.',
    level: 0,
    orderIndex: 2,
    status: 'active'
  },
  {
    name: 'Home & Living',
    description: 'Transform your house into a home with our elegant home decor, furniture, and kitchen essentials. Create cozy, functional, and beautiful living spaces that reflect your personality.',
    level: 0,
    orderIndex: 3,
    status: 'active'
  },
  {
    name: 'Beauty & Personal Care',
    description: 'Pamper yourself with premium skincare, makeup, haircare, and wellness products. Discover trusted brands and natural alternatives for your daily beauty routine.',
    level: 0,
    orderIndex: 4,
    status: 'active'
  },
  {
    name: 'Sports & Outdoors',
    description: 'Gear up for adventure with our extensive range of sports equipment, outdoor gear, and fitness accessories. Whether you\'re a professional athlete or weekend explorer, find everything you need.',
    level: 0,
    orderIndex: 5,
    status: 'active'
  },
  {
    name: 'Books & Media',
    description: 'Feed your mind with our vast collection of books, audiobooks, and educational resources. From bestsellers to academic texts, discover knowledge and entertainment for all ages.',
    level: 0,
    orderIndex: 6,
    status: 'active'
  },
  {
    name: 'Toys & Games',
    description: 'Spark imagination and joy with our selection of toys, games, and educational playthings. Perfect for children of all ages to learn, grow, and have fun.',
    level: 0,
    orderIndex: 7,
    status: 'active'
  },
  {
    name: 'Jewelry & Watches',
    description: 'Adorn yourself with timeless elegance and sophistication. From everyday wear to special occasions, find the perfect piece that complements your style and creates lasting memories.',
    level: 0,
    orderIndex: 8,
    status: 'active'
  },
  {
    name: 'Health & Wellness',
    description: 'Prioritize your wellbeing with our health supplements, fitness trackers, and wellness products. Support your journey to a healthier, more balanced lifestyle.',
    level: 0,
    orderIndex: 9,
    status: 'active'
  },
  {
    name: 'Automotive',
    description: 'Keep your vehicle running smoothly with quality auto parts, accessories, and maintenance products. From interior upgrades to exterior protection, find everything car enthusiasts need.',
    level: 0,
    orderIndex: 10,
    status: 'active'
  }
];

const seedCategories = async () => {
  try {

    const options = {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName: process.env.DB_NAME || 'ecommerce'
    };
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing categories (optional - uncomment if you want fresh data)
    // await Category.deleteMany({});
    // console.log('🗑️  Cleared existing categories\n');

    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log(`📊 Found ${existingCategories} existing categories.`);
      console.log('Skipping category creation. To re-seed, uncomment the deleteMany line.\n');
      
      // Show existing categories
      const categoriesList = await Category.find({});
      console.log('Existing categories:');
      categoriesList.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
      
      await mongoose.disconnect();
      process.exit(0);
    }

    // Insert categories
    let created = 0;
    let failed = 0;

    for (const category of categories) {
      try {
        // Generate slug
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        const newCategory = new Category(category);
        await newCategory.save();
        created++;
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        failed++;
        console.log(`❌ Failed to create category ${category.name}:`, error.message);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 Category Seeding Summary:');
    console.log(`   ✅ Successfully created: ${created}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📦 Total categories: ${categories.length}`);
    console.log('═'.repeat(60));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    process.exit(1);
  }
};

// Run the seeder
seedCategories();