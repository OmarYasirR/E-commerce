// backend/scripts/createProducts.js
const mongoose = require('mongoose');
const Product = require('../src/models/Product.model');
const Category = require('../src/models/Category.model');
require('dotenv').config();


// Helper function to generate placeholder images
const getPlaceholderImage = (productName, bgColor = '4f46e5', textColor = 'ffffff') => {
  const encodedName = encodeURIComponent(productName.substring(0, 40));
  return `https://placehold.co/600x600/${bgColor}/${textColor}?text=${encodedName}`;
};

// Different color schemes for different categories
const imageColors = {
  electronics: '1a1a2e',
  clothing: 'e94560',
  home: '0f3460',
  beauty: 'ff6b6b',
  sports: '4ecdc4',
  books: 'f9a826',
  default: '4f46e5'
};

const getImageColor = (product) => {
  if (product.tags.includes('smartphone')) return imageColors.electronics;
  if (product.tags.includes('clothing') || product.tags.includes('shoes')) return imageColors.clothing;
  if (product.tags.includes('home') || product.tags.includes('furniture')) return imageColors.home;
  if (product.tags.includes('beauty')) return imageColors.beauty;
  if (product.tags.includes('sports')) return imageColors.sports;
  if (product.tags.includes('book')) return imageColors.books;
  return imageColors.default;
};

const products = [
  // Electronics - Smartphones & Accessories
  {
    name: "iPhone 15 Pro Max",
    description: "Apple's most advanced smartphone with A17 Pro chip, titanium design, and pro camera system. Features a 6.7-inch Super Retina XDR display with ProMotion, 48MP main camera with next-generation portraits, and USB-C connector.",
    shortDescription: "Apple's flagship smartphone with A17 Pro chip and titanium design",
    price: 1199.99,
    compareAtPrice: 1299.99,
    costPerItem: 950.00,
    quantity: 45,
    sku: "APL-IP15PM-256",
    tags: ["smartphone", "apple", "premium", "5g", "new"],
    status: "active",
    isFeatured: true,
    images: [
      {
        url: getPlaceholderImage("iPhone 15 Pro Max", imageColors.electronics),
        publicId: "products/iphone15pro",
        isMain: true
      }
    ],
    specifications: {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      storage: "256GB",
      color: "Natural Titanium",
      display: "6.7-inch OLED",
      battery: "4422 mAh"
    }
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Samsung's premium smartphone featuring Galaxy AI, built-in S Pen, 200MP camera with space zoom, and Snapdragon 8 Gen 3 processor. 6.8-inch Dynamic AMOLED 2X display with 120Hz refresh rate.",
    shortDescription: "Premium Android smartphone with AI features and 200MP camera",
    price: 1299.99,
    compareAtPrice: 1399.99,
    costPerItem: 1000.00,
    quantity: 38,
    sku: "SAM-S24U-512",
    tags: ["smartphone", "samsung", "android", "5g", "premium"],
    status: "active",
    isFeatured: true,
    images: [
      {
        url: getPlaceholderImage("Samsung Galaxy S24 Ultra", imageColors.electronics),
        publicId: "products/s24ultra",
        isMain: true
      }
    ],
    specifications: {
      brand: "Samsung",
      model: "Galaxy S24 Ultra",
      storage: "512GB",
      color: "Titanium Gray",
      display: "6.8-inch Dynamic AMOLED",
      battery: "5000 mAh"
    }
  },
  {
    name: "Google Pixel 8 Pro",
    description: "Google's AI-powered smartphone with Tensor G3 chip, pro-level camera system, and 7 years of software updates. Features 6.7-inch Super Actua display and amazing computational photography.",
    shortDescription: "AI-powered smartphone with exceptional camera capabilities",
    price: 999.99,
    compareAtPrice: 1099.99,
    costPerItem: 750.00,
    quantity: 52,
    sku: "GGL-P8P-256",
    tags: ["smartphone", "google", "android", "camera", "ai"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Google Pixel 8 Pro", imageColors.electronics),
        publicId: "products/pixel8pro",
        isMain: true
      }
    ],
    specifications: {
      brand: "Google",
      model: "Pixel 8 Pro",
      storage: "256GB",
      color: "Porcelain",
      display: "6.7-inch OLED",
      battery: "5050 mAh"
    }
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise cancellation with superior sound quality. Features 30-hour battery life, quick charging, and adaptive sound control. The ultimate wireless headphones for music lovers.",
    shortDescription: "Premium noise-cancelling headphones with exceptional sound quality",
    price: 399.99,
    compareAtPrice: 449.99,
    costPerItem: 250.00,
    quantity: 120,
    sku: "SNY-WH1000XM5",
    tags: ["audio", "headphones", "premium", "wireless"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Sony WH-1000XM5 Headphones", imageColors.electronics),
        publicId: "products/sonyxm5",
        isMain: true
      }
    ]
  },

  // Clothing & Fashion
  {
    name: "Men's Classic Leather Jacket",
    description: "Premium genuine leather jacket with classic biker style. Features YKK zippers, quilted lining, and multiple pockets. Perfect for casual and formal wear.",
    shortDescription: "Genuine leather biker jacket for men",
    price: 249.99,
    compareAtPrice: 349.99,
    costPerItem: 120.00,
    quantity: 85,
    sku: "APP-MLJ-001",
    tags: ["jacket", "leather", "men", "fashion", "winter"],
    status: "active",
    isFeatured: true,
    images: [
      {
        url: getPlaceholderImage("Men's Classic Leather Jacket", imageColors.clothing),
        publicId: "products/leather-jacket",
        isMain: true
      }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Brown"]
  },
  {
    name: "Women's Summer Maxi Dress",
    description: "Elegant floral print maxi dress perfect for summer occasions. Made from lightweight, breathable cotton fabric. Features adjustable straps and pockets.",
    shortDescription: "Elegant floral maxi dress for women",
    price: 79.99,
    compareAtPrice: 129.99,
    costPerItem: 35.00,
    quantity: 150,
    sku: "APP-WMD-001",
    tags: ["dress", "women", "summer", "floral", "casual"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Women's Summer Maxi Dress", imageColors.clothing),
        publicId: "products/maxi-dress",
        isMain: true
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Floral Blue", "Floral Pink", "Floral Yellow"]
  },
  {
    name: "Nike Air Max 270",
    description: "Iconic Nike Air Max 270 sneakers with the tallest Air unit yet. Features breathable mesh upper, foam midsole, and rubber outsole for durability.",
    shortDescription: "Comfortable and stylish running shoes",
    price: 149.99,
    compareAtPrice: 169.99,
    costPerItem: 85.00,
    quantity: 200,
    sku: "NKE-AM270-01",
    tags: ["shoes", "sneakers", "nike", "sports", "casual"],
    status: "active",
    isFeatured: true,
    images: [
      {
        url: getPlaceholderImage("Nike Air Max 270", imageColors.sports),
        publicId: "products/airmax270",
        isMain: true
      }
    ],
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black/White", "Red/Black", "Blue/White"]
  },

  // Home & Living
  {
    name: "Modern L-Shaped Sofa",
    description: "Contemporary L-shaped sofa perfect for modern living rooms. Features high-density foam cushions, durable fabric upholstery, and solid wood frame. Includes 2 throw pillows.",
    shortDescription: "Comfortable L-shaped sofa for modern homes",
    price: 899.99,
    compareAtPrice: 1299.99,
    costPerItem: 450.00,
    quantity: 25,
    sku: "HME-LSF-001",
    tags: ["furniture", "sofa", "living room", "modern"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Modern L-Shaped Sofa", imageColors.home),
        publicId: "products/l-sofa",
        isMain: true
      }
    ],
    colors: ["Gray", "Beige", "Blue"]
  },
  {
    name: "LED Smart TV 65-inch 4K",
    description: "Ultra HD 4K Smart TV with HDR10+, Dolby Vision, and built-in Alexa. Features 120Hz refresh rate, 4 HDMI ports, and smart platform with streaming apps.",
    shortDescription: "65-inch 4K Smart TV with HDR and Alexa",
    price: 699.99,
    compareAtPrice: 899.99,
    costPerItem: 450.00,
    quantity: 35,
    sku: "TV-LED65-4K",
    tags: ["electronics", "tv", "4k", "smart tv", "entertainment"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("LED Smart TV 65-inch 4K", imageColors.electronics),
        publicId: "products/smart-tv",
        isMain: true
      }
    ],
    specifications: {
      brand: "Samsung",
      size: "65-inch",
      resolution: "4K Ultra HD",
      refreshRate: "120Hz"
    }
  },
  {
    name: "Ceramic Non-Stick Cookware Set",
    description: "12-piece ceramic non-stick cookware set with eco-friendly coating. Includes frying pans, saucepans, stockpot, and utensils. Oven-safe and dishwasher-safe.",
    shortDescription: "Complete non-stick cookware set for your kitchen",
    price: 159.99,
    compareAtPrice: 249.99,
    costPerItem: 80.00,
    quantity: 60,
    sku: "KIT-CNS-12P",
    tags: ["kitchen", "cookware", "non-stick", "ceramic"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Ceramic Non-Stick Cookware Set", imageColors.kitchen),
        publicId: "products/cookware-set",
        isMain: true
      }
    ]
  },

  // Beauty & Personal Care
  {
    name: "Professional Hair Dryer",
    description: "Salon-grade ionic hair dryer with powerful AC motor. Features multiple heat and speed settings, concentrator nozzle, and diffuser. Reduces frizz and drying time.",
    shortDescription: "Professional ionic hair dryer for salon-quality results",
    price: 89.99,
    compareAtPrice: 149.99,
    costPerItem: 45.00,
    quantity: 95,
    sku: "BEA-HDR-001",
    tags: ["hair care", "beauty", "styling", "professional"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Professional Hair Dryer", imageColors.beauty),
        publicId: "products/hair-dryer",
        isMain: true
      }
    ]
  },
  {
    name: "Luxury Skincare Set",
    description: "Complete 5-piece skincare set including cleanser, toner, serum, moisturizer, and eye cream. Infused with natural ingredients and hyaluronic acid.",
    shortDescription: "Premium skincare set for radiant skin",
    price: 129.99,
    compareAtPrice: 199.99,
    costPerItem: 60.00,
    quantity: 75,
    sku: "BEA-SKS-5P",
    tags: ["skincare", "beauty", "luxury", "natural"],
    status: "active",
    isFeatured: true,
    images: [
      {
        url: getPlaceholderImage("Luxury Skincare Set", imageColors.beauty),
        publicId: "products/skincare-set",
        isMain: true
      }
    ]
  },

  // Sports & Outdoors
  {
    name: "Professional Yoga Mat",
    description: "Eco-friendly non-slip yoga mat with alignment lines. 6mm thickness for joint protection, moisture-resistant, and includes carrying strap.",
    shortDescription: "Premium yoga mat for all types of yoga practice",
    price: 49.99,
    compareAtPrice: 79.99,
    costPerItem: 25.00,
    quantity: 180,
    sku: "SPT-YM-001",
    tags: ["yoga", "fitness", "sports", "exercise"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Professional Yoga Mat", imageColors.sports),
        publicId: "products/yoga-mat",
        isMain: true
      }
    ],
    colors: ["Purple", "Blue", "Green", "Black"]
  },
  {
    name: "Camping Tent 4-Person",
    description: "Weather-resistant 4-person camping tent with easy setup. Features double-layer construction, mesh windows for ventilation, and waterproof rainfly.",
    shortDescription: "Spacious and durable camping tent for families",
    price: 199.99,
    compareAtPrice: 299.99,
    costPerItem: 110.00,
    quantity: 40,
    sku: "SPT-TENT-4P",
    tags: ["camping", "outdoors", "tent", "hiking"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Camping Tent 4-Person", imageColors.sports),
        publicId: "products/camping-tent",
        isMain: true
      }
    ]
  },

  // Books & Media
  {
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel. Explores the strange ways people think about money and offers insights for better financial decisions.",
    shortDescription: "Bestselling book about financial psychology",
    price: 19.99,
    compareAtPrice: 29.99,
    costPerItem: 10.00,
    quantity: 300,
    sku: "BOK-POM-001",
    tags: ["book", "finance", "psychology", "bestseller"],
    status: "active",
    isFeatured: true,
    images: [
      {
        url: getPlaceholderImage("The Psychology of Money", imageColors.books),
        publicId: "products/psychology-money",
        isMain: true
      }
    ]
  },
  {
    name: "Wireless Bluetooth Earbuds",
    description: "True wireless earbuds with noise cancellation and 30-hour battery life. Features touch controls, IPX7 waterproof rating, and wireless charging case.",
    shortDescription: "Premium wireless earbuds with ANC",
    price: 79.99,
    compareAtPrice: 129.99,
    costPerItem: 40.00,
    quantity: 250,
    sku: "AUD-WB-001",
    tags: ["audio", "earbuds", "wireless", "bluetooth"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Wireless Bluetooth Earbuds", imageColors.electronics),
        publicId: "products/earbuds",
        isMain: true
      }
    ],
    colors: ["White", "Black", "Blue"]
  },

  // Additional products to reach 30
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life. Tracks steps, calories, sleep quality, and multiple sports modes.",
    shortDescription: "Feature-packed fitness tracker for active lifestyle",
    price: 149.99,
    compareAtPrice: 199.99,
    costPerItem: 80.00,
    quantity: 110,
    sku: "FIT-SW-001",
    tags: ["fitness", "wearable", "smartwatch", "health"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Smart Fitness Watch", imageColors.electronics),
        publicId: "products/fitness-watch",
        isMain: true
      }
    ],
    colors: ["Black", "Silver", "Rose Gold"]
  },
  {
    name: "Robot Vacuum Cleaner",
    description: "Smart robot vacuum with mapping technology and self-emptying base. Features 2000Pa suction, app control, and voice assistant compatibility.",
    shortDescription: "Automatic robot vacuum for effortless cleaning",
    price: 399.99,
    compareAtPrice: 599.99,
    costPerItem: 220.00,
    quantity: 45,
    sku: "HME-RVC-001",
    tags: ["home", "cleaning", "robot", "smart home"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Robot Vacuum Cleaner", imageColors.home),
        publicId: "products/robot-vacuum",
        isMain: true
      }
    ]
  },
  {
    name: "Gaming Keyboard RGB",
    description: "Mechanical gaming keyboard with customizable RGB lighting and programmable macros. Features anti-ghosting, wrist rest, and durable mechanical switches.",
    shortDescription: "RGB mechanical keyboard for gamers",
    price: 89.99,
    compareAtPrice: 129.99,
    costPerItem: 50.00,
    quantity: 95,
    sku: "GAM-KB-001",
    tags: ["gaming", "keyboard", "accessories", "rgb"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Gaming Keyboard RGB", imageColors.electronics),
        publicId: "products/gaming-keyboard",
        isMain: true
      }
    ],
    switchTypes: ["Red", "Blue", "Brown"]
  },
  {
    name: "Leather Wallet for Men",
    description: "Genuine leather bifold wallet with RFID blocking technology. Features 8 card slots, 2 bill compartments, and ID window. Compact and stylish.",
    shortDescription: "Premium leather wallet with RFID protection",
    price: 39.99,
    compareAtPrice: 59.99,
    costPerItem: 20.00,
    quantity: 280,
    sku: "ACC-LW-001",
    tags: ["wallet", "leather", "accessories", "men"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Leather Wallet for Men", imageColors.accessories),
        publicId: "products/leather-wallet",
        isMain: true
      }
    ],
    colors: ["Black", "Brown", "Tan"]
  },
  {
    name: "Portable Power Bank 20000mAh",
    description: "High-capacity power bank with fast charging and dual USB ports. Features LED indicator, compact design, and safety protection for all devices.",
    shortDescription: "20000mAh portable charger for all devices",
    price: 49.99,
    compareAtPrice: 69.99,
    costPerItem: 25.00,
    quantity: 320,
    sku: "ACC-PB-20K",
    tags: ["power bank", "charger", "portable", "electronics"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Portable Power Bank 20000mAh", imageColors.electronics),
        publicId: "products/power-bank",
        isMain: true
      }
    ],
    colors: ["Black", "White", "Blue"]
  },
  {
    name: "Instant Pot Duo 7-in-1",
    description: "Multi-functional pressure cooker that replaces 7 kitchen appliances. Features 13 programmable settings, dishwasher-safe lid, and recipe book included.",
    shortDescription: "Versatile pressure cooker for quick meals",
    price: 99.99,
    compareAtPrice: 149.99,
    costPerItem: 65.00,
    quantity: 85,
    sku: "KIT-IP-7IN1",
    tags: ["kitchen", "cooker", "pressure cooker", "appliance"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Instant Pot Duo 7-in-1", imageColors.kitchen),
        publicId: "products/instant-pot",
        isMain: true
      }
    ],
    sizes: ["6 Quart", "8 Quart"]
  },
  {
    name: "Men's Running Shoes",
    description: "Lightweight running shoes with responsive cushioning and breathable mesh upper. Features durable rubber outsole and padded collar for comfort.",
    shortDescription: "Comfortable running shoes for daily workouts",
    price: 79.99,
    compareAtPrice: 119.99,
    costPerItem: 45.00,
    quantity: 210,
    sku: "SPT-RS-001",
    tags: ["shoes", "running", "sports", "men"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Men's Running Shoes", imageColors.sports),
        publicId: "products/running-shoes",
        isMain: true
      }
    ],
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black/Red", "Blue/White", "Gray/Orange"]
  },
  {
    name: "Women's Handbag Tote",
    description: "Stylish tote bag made from vegan leather with multiple compartments. Features zipper closure, inner pockets, and detachable shoulder strap.",
    shortDescription: "Elegant and spacious tote bag for women",
    price: 69.99,
    compareAtPrice: 99.99,
    costPerItem: 35.00,
    quantity: 130,
    sku: "ACC-TOTE-001",
    tags: ["bag", "handbag", "women", "fashion"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Women's Handbag Tote", imageColors.fashion),
        publicId: "products/tote-bag",
        isMain: true
      }
    ],
    colors: ["Black", "Brown", "Tan", "Red"]
  },
  {
    name: "Air Purifier for Home",
    description: "HEPA air purifier with 3-stage filtration system. Covers up to 350 sq ft, features quiet operation, and auto mode with air quality sensor.",
    shortDescription: "HEPA air purifier for clean indoor air",
    price: 199.99,
    compareAtPrice: 299.99,
    costPerItem: 120.00,
    quantity: 55,
    sku: "HME-AP-001",
    tags: ["home", "air purifier", "health", "appliance"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Air Purifier for Home", imageColors.home),
        publicId: "products/air-purifier",
        isMain: true
      }
    ]
  },
  {
    name: "Electric Toothbrush",
    description: "Sonic electric toothbrush with 3 brushing modes and pressure sensor. Features 2-minute timer, long battery life, and includes 6 brush heads.",
    shortDescription: "Advanced sonic toothbrush for better oral care",
    price: 59.99,
    compareAtPrice: 89.99,
    costPerItem: 30.00,
    quantity: 165,
    sku: "BEA-ET-001",
    tags: ["oral care", "toothbrush", "electric", "personal care"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Electric Toothbrush", imageColors.personalCare),
        publicId: "products/electric-toothbrush",
        isMain: true
      }
    ],
    colors: ["White", "Black", "Pink"]
  },
  {
    name: "Desk Office Chair",
    description: "Ergonomic office chair with adjustable height, lumbar support, and breathable mesh back. Features 360-degree swivel and smooth-rolling casters.",
    shortDescription: "Comfortable ergonomic chair for home office",
    price: 249.99,
    compareAtPrice: 349.99,
    costPerItem: 150.00,
    quantity: 70,
    sku: "FUR-OC-001",
    tags: ["furniture", "office", "chair", "ergonomic"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Desk Office Chair", imageColors.furniture),
        publicId: "products/office-chair",
        isMain: true
      }
    ],
    colors: ["Black", "Gray"]
  },
  {
    name: "Wireless Gaming Mouse",
    description: "Ultra-lightweight wireless gaming mouse with 16000 DPI sensor and RGB lighting. Features 6 programmable buttons and 70-hour battery life.",
    shortDescription: "High-performance wireless mouse for gamers",
    price: 69.99,
    compareAtPrice: 99.99,
    costPerItem: 40.00,
    quantity: 145,
    sku: "GAM-MOUSE-001",
    tags: ["gaming", "mouse", "wireless", "accessories"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Wireless Gaming Mouse", imageColors.electronics),
        publicId: "products/gaming-mouse",
        isMain: true
      }
    ],
    colors: ["Black", "White"]
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Vacuum insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. Features leak-proof lid, powder coating, and BPA-free construction.",
    shortDescription: "Double-wall insulated water bottle",
    price: 29.99,
    compareAtPrice: 49.99,
    costPerItem: 15.00,
    quantity: 400,
    sku: "SPT-WB-001",
    tags: ["hydration", "outdoors", "bottle", "eco-friendly"],
    status: "active",
    images: [
      {
        url: getPlaceholderImage("Stainless Steel Water Bottle", imageColors.hydration),
        publicId: "products/water-bottle",
        isMain: true
      }
    ],
    sizes: ["18oz", "24oz", "32oz"],
    colors: ["Black", "White", "Blue", "Red", "Green"]
  }
];

const createProducts = async () => {
  try {
    // Connect to MongoDB
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

    // Get all categories
    const categories = await Category.find({});
    console.log(`📁 Found ${categories.length} categories\n`);

    if (categories.length === 0) {
      console.log('❌ No categories found. Please run category seeder first.');
      process.exit(1);
    }

    // Create a mapping of category names to IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat._id;
    });

    // Assign categories to products
    const productsWithCategories = products.map(product => {
      let assignedCategory = null;
      
      // Assign based on product tags/type
      if (product.tags.includes('smartphone') || product.tags.includes('audio') || product.tags.includes('tv')) {
        assignedCategory = categoryMap['electronics'];
      } else if (product.tags.includes('jacket') || product.tags.includes('dress') || product.tags.includes('shoes')) {
        assignedCategory = categoryMap['clothing & fashion'];
      } else if (product.tags.includes('furniture') || product.tags.includes('kitchen') || product.tags.includes('home')) {
        assignedCategory = categoryMap['home & living'];
      } else if (product.tags.includes('beauty') || product.tags.includes('skincare') || product.tags.includes('hair')) {
        assignedCategory = categoryMap['beauty & personal care'];
      } else if (product.tags.includes('yoga') || product.tags.includes('camping') || product.tags.includes('fitness')) {
        assignedCategory = categoryMap['sports & outdoors'];
      } else if (product.tags.includes('book')) {
        assignedCategory = categoryMap['books & media'];
      } else if (product.tags.includes('gaming') || product.tags.includes('accessories')) {
        assignedCategory = categoryMap['electronics'];
      } else {
        // Default to electronics if no match
        assignedCategory = categoryMap['electronics'];
      }
      
      return {
        ...product,
        category: assignedCategory
      };
    });

    // Clear existing products (optional - comment out if you want to keep existing)
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products\n');

    // Insert products
    let created = 0;
    let failed = 0;

    for (const product of productsWithCategories) {
      try {
        // Generate slug
        const slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        product.slug = slug;
        
        const newProduct = new Product(product);
        await newProduct.save();
        created++;
        console.log(`✅ Created: ${product.name}`);
      } catch (error) {
        failed++;
        console.log(`❌ Failed: ${product.name} - ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 Products Seeding Summary:');
    console.log(`   ✅ Successfully created: ${created}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📦 Total products: ${products.length}`);
    console.log('═'.repeat(60));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    process.exit(1);
  }
};

// Run the seeder
createProducts();