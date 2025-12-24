import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DUMMY_PRODUCTS, CATEGORIES } from '@/data/products';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Products = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [priceRange, setPriceRange] = useState([0, 400000]);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API}/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API}/products`;
        const params = new URLSearchParams();
        
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        if (priceRange[0] > 0) {
          params.append('min_price', priceRange[0]);
        }
        if (priceRange[1] < 400000) {
          params.append('max_price', priceRange[1]);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const res = await axios.get(url);
        let sortedProducts = res.data;
        
        // Client-side sorting
        if (sortBy === 'price-low') {
          sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          sortedProducts.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to dummy data
        let filtered = [...DUMMY_PRODUCTS];
        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (searchQuery) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (sortBy === 'price-low') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        setProducts(filtered);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery, priceRange, sortBy]);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 400000]);
    setSortBy('default');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 400000;

  const getCategoryName = () => {
    if (selectedCategory === 'all' || !selectedCategory) return 'All Products';
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.name : selectedCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="pt-20 min-h-screen" data-testid="products-page">
      {/* Header */}
      <div className="bg-card border-b border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-2">Collection</p>
          <h1 className="font-heading text-3xl md:text-4xl font-semibold">{getCategoryName()}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border h-12 rounded-none"
              data-testid="search-input"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 h-12 rounded-none border-border"
            data-testid="filter-toggle"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>

          {/* Desktop Filters */}
          <div className={`flex flex-col lg:flex-row gap-4 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
            {/* Category Select */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger 
                className="w-full lg:w-[180px] h-12 rounded-none bg-secondary/50 border-border"
                data-testid="category-select"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-none">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Select */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger 
                className="w-full lg:w-[180px] h-12 rounded-none bg-secondary/50 border-border"
                data-testid="sort-select"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-none">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-12 px-4 text-muted-foreground hover:text-foreground"
                data-testid="clear-filters"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className={`mb-8 p-6 bg-card border border-border/50 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Price Range:</span>
            <div className="flex-1 max-w-md">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={400000}
                step={10000}
                className="w-full"
                data-testid="price-slider"
              />
            </div>
            <span className="text-sm text-foreground whitespace-nowrap">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </span>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-muted-foreground text-sm mb-8">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>

        {/* Products Grid */}
        {loading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] skeleton" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">No products found</p>
            <Button 
              onClick={clearFilters}
              className="bg-primary text-primary-foreground rounded-none"
              data-testid="clear-all-btn"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
