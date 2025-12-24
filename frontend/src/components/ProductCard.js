import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const ProductCard = ({ product, featured = false }) => {
  const { addToCart, loading } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart(product.id);
    if (success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className={`group relative bg-card border border-border/50 card-hover overflow-hidden ${
        featured ? 'product-featured' : ''
      }`}
      data-testid={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div className={`img-hover-zoom ${featured ? 'aspect-square' : 'aspect-[3/4]'}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
      </div>

      {/* Quick Add Button */}
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="absolute bottom-4 left-4 right-4 bg-primary text-primary-foreground py-3 text-xs font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-accent btn-press disabled:opacity-50"
        data-testid={`add-to-cart-${product.id}`}
      >
        Add to Cart
      </button>

      {/* Product Info */}
      <div className="p-6">
        <p className="text-muted-foreground text-xs tracking-wider uppercase mb-2">
          {product.category.replace('-', ' ')}
        </p>
        <h3 className="font-heading text-lg font-medium mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="price-tag text-primary text-lg">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* Featured Badge */}
      {product.featured && (
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold tracking-wider uppercase">
          Featured
        </div>
      )}
    </Link>
  );
};

export default ProductCard;
