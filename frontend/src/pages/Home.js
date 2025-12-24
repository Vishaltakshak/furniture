import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Truck, Shield, Headphones } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/products?featured=true`),
          axios.get(`${API}/categories`)
        ]);
        setFeaturedProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹50,000' },
    { icon: Shield, title: '5-Year Warranty', desc: 'Quality guaranteed' },
    { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
  ];

  return (
    <div className="pt-20" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1640357897497-599b4fc84f51?w=1920&q=80"
            alt="Luxury Living Room"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl animate-fade-in">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4 stagger-1 animate-fade-in">
              Luxury Furniture Collection
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6 stagger-2 animate-fade-in">
              Elevate Your Living Space
            </h1>
            <p className="text-white/70 text-lg mb-8 stagger-3 animate-fade-in">
              Discover handcrafted furniture that combines timeless elegance with modern sophistication.
            </p>
            <div className="flex flex-wrap gap-4 stagger-4 animate-fade-in">
              <Link 
                to="/products"
                className="bg-primary text-primary-foreground px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-accent transition-all btn-press"
                data-testid="hero-shop-btn"
              >
                Shop Collection
              </Link>
              <Link 
                to="/products/living-room"
                className="bg-transparent border border-white/30 text-white px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:border-primary hover:text-primary transition-all"
                data-testid="hero-explore-btn"
              >
                Explore Living Room
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/50 text-xs tracking-wider uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <feature.icon className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Browse By</p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold">Categories</h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 md:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Curated Selection</p>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold">Featured Products</h2>
            </div>
            <Link 
              to="/products"
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors group"
              data-testid="view-all-link"
            >
              <span className="text-sm tracking-wider uppercase">View All</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] skeleton" />
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.slice(0, 6).map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  featured={index === 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1606659894125-40824878b6ce?w=1920&q=80"
            alt="Dining Setup"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Transform Your Home</p>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold mb-6">
            Where Luxury Meets Comfort
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Experience the perfect blend of sophistication and comfort with our meticulously crafted furniture pieces.
          </p>
          <Link 
            to="/products"
            className="inline-block bg-primary text-primary-foreground px-10 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-accent transition-all btn-press"
            data-testid="cta-shop-btn"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
