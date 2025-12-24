import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DUMMY_PRODUCTS } from '@/data/products';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, loading: cartLoading } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products/${id}`);
        setProduct(res.data);
        
        // Fetch related products
        const relatedRes = await axios.get(`${API}/products?category=${res.data.category}`);
        setRelatedProducts(relatedRes.data.filter(p => p.id !== id).slice(0, 4));
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to dummy data
        const found = DUMMY_PRODUCTS.find(p => p.id === parseInt(id));
        if (found) {
          setProduct(found);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      toast.success(`${product.name} added to cart`, {
        description: `Quantity: ${quantity}`
      });
    } else {
      toast.error('Failed to add to cart');
    }
  };

  const features = [
    { icon: Truck, text: 'Free shipping on orders over ₹50,000' },
    { icon: Shield, text: '5-year warranty included' },
    { icon: RotateCcw, text: '30-day return policy' },
  ];

  if (loading) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square skeleton" />
            <div className="space-y-6">
              <div className="h-8 w-32 skeleton" />
              <div className="h-12 w-3/4 skeleton" />
              <div className="h-8 w-40 skeleton" />
              <div className="h-32 skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl mb-4">Product not found</h2>
          <Link to="/products" className="text-primary hover:text-accent">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 group"
          data-testid="back-link"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm tracking-wider uppercase">Back to Products</span>
        </Link>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="img-hover-zoom aspect-square bg-card border border-border/50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-2">
              {product.category.replace('-', ' ')}
            </p>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-4" data-testid="product-name">
              {product.name}
            </h1>
            <p className="text-primary text-2xl md:text-3xl mb-6 price-tag" data-testid="product-price">
              {formatPrice(product.price)}
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8" data-testid="product-description">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="space-y-4 py-6 border-t border-b border-border/50 mb-8">
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="text-foreground">{product.dimensions}</span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material</span>
                  <span className="text-foreground">{product.material}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Availability</span>
                <span className={product.in_stock ? 'text-green-500' : 'text-destructive'}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-4 hover:bg-secondary/50 transition-colors"
                  data-testid="quantity-decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-4 min-w-[60px] text-center" data-testid="quantity-value">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-4 hover:bg-secondary/50 transition-colors"
                  data-testid="quantity-increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={cartLoading || !product.in_stock}
                className="flex-1 bg-primary text-primary-foreground h-14 text-xs font-semibold tracking-widest uppercase hover:bg-accent rounded-none btn-press disabled:opacity-50"
                data-testid="add-to-cart-btn"
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-4 mt-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-muted-foreground">
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-20 border-t border-border/50">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link 
                  key={relProduct.id}
                  to={`/product/${relProduct.id}`}
                  className="group"
                  data-testid={`related-product-${relProduct.id}`}
                >
                  <div className="img-hover-zoom aspect-[3/4] bg-card border border-border/50 mb-4 overflow-hidden">
                    <img
                      src={relProduct.image}
                      alt={relProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-heading text-sm group-hover:text-primary transition-colors">
                    {relProduct.name}
                  </h4>
                  <p className="text-primary text-sm price-tag">{formatPrice(relProduct.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
