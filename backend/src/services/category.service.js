const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const ApiError = require('../utils/ApiError');
const redisService = require('./redis.service');

class CategoryService {

  async getAllCategories({ includeProducts = false, status = 'active' } = {}) {
    try {
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      
      const categories = await Category.find(query)
        .populate('parent', 'name slug')
        .sort('orderIndex');
      
      if (includeProducts) {
        for (const category of categories) {
          const productCount = await Product.countDocuments({ 
            category: category._id, 
            status: 'active' 
          });
          category.productCount = productCount;
        }
      }
      
      return categories;
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  }

  /**
   * Get hierarchical category tree
   * @returns {Promise<Array>} Category tree structure
   */
  async getCategoryTree() {
    try {
      const categories = await Category.find({ status: 'active' })
        .populate('parent', 'name slug')
        .sort('orderIndex')
        .lean();
      
      // Build tree structure
      const categoryMap = {};   
      const tree = [];
      
      // First, create a map of all categories
      categories.forEach(category => {
        categoryMap[category._id] = { 
          ...category, 
          children: [] 
        };
      });
      
      // Then, build the tree by linking children to parents
      categories.forEach(category => {
        if (category.parent && categoryMap[category.parent]) {
          categoryMap[category.parent].children.push(categoryMap[category._id]);
        } else {
          tree.push(categoryMap[category._id]);
        }
      });
      
      return tree;
    } catch (error) {
      console.error('Error in getCategoryTree:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Category object
   */
  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId)
        .populate('parent', 'name slug');
      
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      return category;
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      throw error;
    }
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} Category object
   */
  async getCategoryBySlug(slug) {
    try {
      const category = await Category.findOne({ slug, status: 'active' })
        .populate('parent', 'name slug');
      
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      return category;
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    try {
      // Validate required fields
      if (!categoryData.name || categoryData.name.trim() === '') {
        throw new ApiError(400, 'Category name is required');
      }
      
      // Check for duplicate name
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') } 
      });
      
      if (existingCategory) {
        throw new ApiError(400, 'Category with this name already exists');
      }
      
      // Set parent and level
      if (categoryData.parent) {
        const parentCategory = await Category.findById(categoryData.parent);
        if (!parentCategory) {
          throw new ApiError(404, 'Parent category not found');
        }
        categoryData.level = parentCategory.level + 1;
      } else {
        categoryData.parent = null;
        categoryData.level = 0;
      }
      
      // Set default values
      categoryData.orderIndex = categoryData.orderIndex || 0;
      categoryData.status = categoryData.status || 'active';
      
      // Create slug from name
      categoryData.slug = this.generateSlug(categoryData.name);
      
      // Check if slug already exists
      const existingSlug = await Category.findOne({ slug: categoryData.slug });
      if (existingSlug) {
        categoryData.slug = `${categoryData.slug}-${Date.now()}`;
      }
      
      const category = new Category(categoryData);
      await category.save();
      
      // Clear cache
      await this.clearCategoryCache();
      
      return category;
    } catch (error) {
      console.error('Error in createCategory:', error);
      throw error;
    }
  }

  /**
   * Update an existing category
   * @param {string} categoryId - Category ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(categoryId, updateData) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      // Check if updating name and if it's duplicate
      if (updateData.name && updateData.name !== category.name) {
        const existingCategory = await Category.findOne({ 
          name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
          _id: { $ne: categoryId }
        });
        
        if (existingCategory) {
          throw new ApiError(400, 'Category with this name already exists');
        }
        
        // Update slug if name changed
        updateData.slug = this.generateSlug(updateData.name);
        
        // Check if new slug already exists
        const existingSlug = await Category.findOne({ 
          slug: updateData.slug,
          _id: { $ne: categoryId }
        });
        if (existingSlug) {
          updateData.slug = `${updateData.slug}-${Date.now()}`;
        }
      }
      
      // Handle parent category update
      if (updateData.parent !== undefined) {
        if (updateData.parent === categoryId) {
          throw new ApiError(400, 'Category cannot be its own parent');
        }
        
        if (updateData.parent && updateData.parent !== '') {
          const parentCategory = await Category.findById(updateData.parent);
          if (!parentCategory) {
            throw new ApiError(404, 'Parent category not found');
          }
          
          // Check for circular reference
          const descendants = await this.getDescendants(categoryId);
          if (descendants.some(desc => desc._id.toString() === updateData.parent)) {
            throw new ApiError(400, 'Cannot set a descendant as parent');
          }
          
          updateData.level = parentCategory.level + 1;
        } else {
          updateData.parent = null;
          updateData.level = 0;
        }
      }
      
      // Update the category
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('parent', 'name slug');
      
      // If parent changed, update all descendants' levels
      if (updateData.parent !== undefined) {
        await this.updateDescendantsLevels(categoryId, updatedCategory.level + 1);
      }
      
      // Clear cache
      await this.clearCategoryCache();
      
      return updatedCategory;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   * @param {string} categoryId - Category ID
   * @param {string} moveProductsTo - Destination category ID for products
   * @returns {Promise<boolean>} Success status
   */
  async deleteCategory(categoryId, moveProductsTo = null) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      // Check if category has products
      const hasProducts = await Product.exists({ category: categoryId });
      
      if (hasProducts && !moveProductsTo) {
        throw new ApiError(400, 'Category has products. Please specify a destination category for products');
      }
      
      // Move products to another category if specified
      if (moveProductsTo) {
        const targetCategory = await Category.findById(moveProductsTo);
        if (!targetCategory) {
          throw new ApiError(404, 'Destination category not found');
        }
        
        await Product.updateMany(
          { category: categoryId },
          { category: moveProductsTo }
        );
        
        // Update product counts
        await this.updateProductCount(categoryId);
        await this.updateProductCount(moveProductsTo);
      }
      
      // Recursively delete subcategories
      const subcategories = await Category.find({ parent: categoryId });
      for (const subcategory of subcategories) {
        await this.deleteCategory(subcategory._id, moveProductsTo);
      }
      
      // Delete the category
      await Category.findByIdAndDelete(categoryId);
      
      // Clear cache
      await this.clearCategoryCache();
      
      return true;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  }

  /**
   * Get products in a category (including subcategories)
   * @param {string} categoryId - Category ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Products and pagination info
   */
  async getCategoryProducts(categoryId, { page = 1, limit = 20, sort = '-createdAt' }) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      // Get all subcategory IDs
      const categoryIds = [categoryId];
      const descendants = await this.getDescendants(categoryId);
      categoryIds.push(...descendants.map(desc => desc._id));
      
      const skip = (page - 1) * limit;
      
      const query = { 
        category: { $in: categoryIds },
        status: 'active'
      };
      
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('category', 'name slug')
          .select('name price images ratings slug shortDescription quantity'),
        Product.countDocuments(query)
      ]);
      
      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug
        }
      };
    } catch (error) {
      console.Error('Error in getCategoryProducts:', error);
      throw error;
    }
  }

  /**
   * Update category display order
   * @param {Array} orders - Array of { id, order } objects
   * @returns {Promise<Array>} Updated categories
   */
  async updateCategoryOrder(orders) {
    try {
      const updates = orders.map(order => 
        Category.findByIdAndUpdate(order.id, { orderIndex: order.order })
      );
      
      await Promise.all(updates);
      
      // Clear cache
      await this.clearCategoryCache();
      
      return await Category.find().sort('orderIndex');
    } catch (error) {
      console.error('Error in updateCategoryOrder:', error);
      throw error;
    }
  }

  /**
   * Toggle category status
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Updated category
   */
  async toggleCategoryStatus(categoryId) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      category.status = category.status === 'active' ? 'inactive' : 'active';
      await category.save();
      
      // If deactivating, also deactivate all products in this category
      if (category.status === 'inactive') {
        await Product.updateMany(
          { category: categoryId },
          { status: 'inactive' }
        );
      }
      
      // Clear cache
      await this.clearCategoryCache();
      
      return category;
    } catch (error) {
      console.error('Error in toggleCategoryStatus:', error);
      throw error;
    }
  }

  /**
   * Get category statistics
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Category stats
   */
  async getCategoryStats(categoryId) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      const categoryIds = [categoryId];
      const descendants = await this.getDescendants(categoryId);
      categoryIds.push(...descendants.map(desc => desc._id));
      
      const stats = await Product.aggregate([
        { $match: { category: { $in: categoryIds }, status: 'active' } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            totalStock: { $sum: '$quantity' },
            totalSold: { $sum: '$soldQuantity' }
          }
        }
      ]);
      
      return {
        category: {
          id: category._id,
          name: category.name,
          level: category.level,
          status: category.status
        },
        productStats: stats[0] || {
          totalProducts: 0,
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          totalStock: 0,
          totalSold: 0
        },
        subcategoriesCount: descendants.length
      };
    } catch (error) {
      console.error('Error in getCategoryStats:', error);
      throw error;
    }
  }

  /**
   * Search categories by name or description
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching categories
   */
  async searchCategories(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return [];
      }
      
      const categories = await Category.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ],
        status: 'active'
      })
      .limit(20)
      .populate('parent', 'name slug');
      
      return categories;
    } catch (error) {
      console.error('Error in searchCategories:', error);
      throw error;
    }
  }

  /**
   * Get category breadcrumbs
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Breadcrumb trail
   */
  async getBreadcrumbs(categoryId) {
    try {
      const breadcrumbs = [];
      let currentCategory = await Category.findById(categoryId);
      
      while (currentCategory) {
        breadcrumbs.unshift({
          id: currentCategory._id,
          name: currentCategory.name,
          slug: currentCategory.slug
        });
        
        if (currentCategory.parent) {
          currentCategory = await Category.findById(currentCategory.parent);
        } else {
          break;
        }
      }
      
      return breadcrumbs;
    } catch (error) {
      console.error('Error in getBreadcrumbs:', error);
      throw error;
    }
  }

  /**
   * Get category hierarchy (complete tree with all levels)
   * @returns {Promise<Array>} Complete category hierarchy
   */
  async getCategoryHierarchy() {
    try {
      const categories = await Category.find()
        .select('name slug parent level orderIndex status')
        .sort('orderIndex')
        .lean();
      
      const buildHierarchy = (parentId = null) => {
        return categories
          .filter(cat => {
            if (parentId === null) {
              return !cat.parent;
            }
            return cat.parent && cat.parent.toString() === parentId.toString();
          })
          .map(cat => ({
            ...cat,
            children: buildHierarchy(cat._id)
          }));
      };
      
      return buildHierarchy();
    } catch (error) {
      console.error('Error in getCategoryHierarchy:', error);
      throw error;
    }
  }

  /**
   * Update product count for a category
   * @param {string} categoryId - Category ID
   * @returns {Promise<void>}
   */
  async updateProductCount(categoryId) {
    try {
      const count = await Product.countDocuments({ 
        category: categoryId, 
        status: 'active' 
      });
      await Category.findByIdAndUpdate(categoryId, { productCount: count });
    } catch (error) {
      console.error('Error in updateProductCount:', error);
    }
  }

  /**
   * Get all descendants of a category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Descendant categories
   */
  async getDescendants(categoryId) {
    const descendants = [];
    const queue = [categoryId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      const children = await Category.find({ parent: currentId });
      
      for (const child of children) {
        descendants.push(child);
        queue.push(child._id);
      }
    }
    
    return descendants;
  }

  /**
   * Update levels of all descendants
   * @param {string} categoryId - Category ID
   * @param {number} startLevel - Starting level
   * @returns {Promise<void>}
   */
  async updateDescendantsLevels(categoryId, startLevel) {
    const descendants = await this.getDescendants(categoryId);
    
    for (const descendant of descendants) {
      const level = startLevel + (descendant.level - (startLevel - 1));
      await Category.findByIdAndUpdate(descendant._id, { level });
    }
  }

  /**
   * Generate URL-friendly slug
   * @param {string} text - Text to convert to slug
   * @returns {string} Generated slug
   */
  generateSlug(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  /**
   * Clear all category-related cache
   * @returns {Promise<void>}
   */
  async clearCategoryCache() {
    try {
      await redisService.delPattern('categories:*');
      await redisService.delPattern('category:*');
      await redisService.del('category-tree');
      console.log('Category cache cleared successfully');
    } catch (error) {
      console.error('Error clearing category cache:', error);
    }
  }
}

module.exports = new CategoryService();