import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (cart.items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center" data-testid="empty-cart">
        <div className="text-center px-6">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
          <Link 
            to="/products"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-accent transition-all btn-press"
            data-testid="continue-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-2">Shopping</p>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold">Your Cart</h1>
          </div>
          <Link 
            to="/products"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider uppercase hidden sm:inline">Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div 
                key={item.product_id}
                className="flex gap-6 p-6 bg-card border border-border/50"
                data-testid={`cart-item-${item.product_id}`}
              >
                {/* Image */}
                <Link 
                  to={`/product/${item.product_id}`}
                  className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-secondary"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/product/${item.product_id}`}
                    className="font-heading text-lg hover:text-primary transition-colors block mb-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-primary price-tag mb-4">{formatPrice(item.price)}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={loading}
                        className="p-2 hover:bg-secondary/50 transition-colors disabled:opacity-50"
                        data-testid={`decrease-${item.product_id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 py-2 min-w-[40px] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={loading}
                        className="p-2 hover:bg-secondary/50 transition-colors disabled:opacity-50"
                        data-testid={`increase-${item.product_id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      disabled={loading}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      data-testid={`remove-${item.product_id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right hidden md:block">
                  <p className="text-muted-foreground text-xs mb-1">Total</p>
                  <p className="font-semibold price-tag">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 p-6 sticky top-28">
              <h3 className="font-heading text-xl font-semibold mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground price-tag">{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground">
                    {cart.total >= 50000 ? 'Free' : formatPrice(5000)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (GST 18%)</span>
                  <span className="text-foreground price-tag">{formatPrice(cart.total * 0.18)}</span>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-lg">Total</span>
                  <span className="font-heading text-2xl text-primary price-tag" data-testid="cart-total">
                    {formatPrice(cart.total + (cart.total >= 50000 ? 0 : 5000) + (cart.total * 0.18))}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-primary-foreground h-14 text-xs font-semibold tracking-widest uppercase hover:bg-accent rounded-none btn-press"
                data-testid="checkout-btn"
              >
                Proceed to Checkout
              </Button>

              <p className="text-center text-muted-foreground text-xs mt-4">
                Secure checkout powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
