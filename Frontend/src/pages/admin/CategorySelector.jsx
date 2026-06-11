import React, { useState, useEffect } from 'react';
import { IoChevronDown, IoFolderOpen } from 'react-icons/io5';
import categoryService from '../../services/categoryService';

const CategorySelector = ({ value, onChange, placeholder = "Select category" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (value && categories.length) {
      const findCategory = (cats) => {
        for (const cat of cats) {
          if (cat._id === value) return cat;
          if (cat.children) {
            const found = findCategory(cat.children);
            if (found) return found;
          }
        }
        return null;
      };
      setSelectedCategory(findCategory(categories));
    }
  }, [value]);

  const loadCategories = async () => {
    try {
      const tree = await categoryService.getCategoryTree();
      setCategories(tree);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOption = (category, level = 0) => {
    return (
      <div key={category._id}>
        <button
          type="button"
          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          style={{ paddingLeft: `${16 + level * 16}px` }}
          onClick={() => {
            setSelectedCategory(category);
            onChange(category._id);
            setIsOpen(false); 
          }} 
        >
          <IoFolderOpen className="text-yellow-500 text-xl" size={18} />
          <span>{category.name}</span>
        </button>
        {category.children?.map(child => renderCategoryOption(child, level + 1))}
      </div>
    );
  };

  if (loading) {
    return <div className="px-4 py-2 border rounded-lg bg-gray-100">Loading categories...</div>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
      >
        <span className="flex items-center gap-2">
          <IoFolderOpen className="text-yellow-500" size={18} />
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <IoChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <button
            type="button"
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              setSelectedCategory(null);
              onChange('');
              setIsOpen(false);
            }}
          >
            <IoFolderOpen className="text-gray-400" size={16} />
            <span>None</span>
          </button>
          {categories.map(cat => renderCategoryOption(cat))}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;