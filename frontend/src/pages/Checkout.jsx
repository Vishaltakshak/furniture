import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const { cart, cartId, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
      return;
    }

    // Navigate to payment page with form data
    navigate('/payment', { 
      state: { 
        formData: formData, 
        cartId: cartId 
      } 
    });
  };

  const shipping = cart.total >= 50000 ? 0 : 5000;
  const tax = cart.total * 0.18;
  const total = cart.total + shipping + tax;

  if (cart.items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-4">No Items to Checkout</h2>
          <p className="text-muted-foreground mb-8">Add some items to your cart first.</p>
          <Link 
            to="/products"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-accent transition-all btn-press"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen" data-testid="checkout-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-2">Secure</p>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold">Checkout</h1>
          </div>
          <Link 
            to="/cart"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider uppercase hidden sm:inline">Back to Cart</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Customer Details Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Information */}
              <div className="bg-card border border-border/50 p-6 md:p-8">
                <h2 className="font-heading text-xl font-semibold mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="full_name" className="text-sm text-muted-foreground mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`h-12 bg-secondary/50 border-border rounded-none ${errors.full_name ? 'border-destructive' : ''}`}
                      data-testid="input-full-name"
                    />
                    {errors.full_name && <p className="text-destructive text-xs mt-1">{errors.full_name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm text-muted-foreground mb-2 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`h-12 bg-secondary/50 border-border rounded-none ${errors.email ? 'border-destructive' : ''}`}
                      data-testid="input-email"
                    />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm text-muted-foreground mb-2 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={`h-12 bg-secondary/50 border-border rounded-none ${errors.phone ? 'border-destructive' : ''}`}
                      data-testid="input-phone"
                    />
                    {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card border border-border/50 p-6 md:p-8">
                <h2 className="font-heading text-xl font-semibold mb-6">Shipping Address</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="text-sm text-muted-foreground mb-2 block">
                      Street Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main Street, Apartment 4B"
                      className={`h-12 bg-secondary/50 border-border rounded-none ${errors.address ? 'border-destructive' : ''}`}
                      data-testid="input-address"
                    />
                    {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-sm text-muted-foreground mb-2 block">
                      City *
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className={`h-12 bg-secondary/50 border-border rounded-none ${errors.city ? 'border-destructive' : ''}`}
                      data-testid="input-city"
                    />
                    {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm text-muted-foreground mb-2 block">
                      State *
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      className={`h-12 bg-secondary/50 border-border rounded-none ${errors.state ? 'border-destructive' : ''}`}
                      data-testid="input-state"
                    />
                    {errors.state && <p className="text-destructive text-xs mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <Label htmlFor="pincode" className="text-sm text-muted-foreground mb-2 block">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="400001"
                      className={`h-12 bg-secondary/50 border-border rounded-none ${errors.pincode ? 'border-destructive' : ''}`}
                      data-testid="input-pincode"
                    />
                    {errors.pincode && <p className="text-destructive text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border/50 p-6 sticky top-28">
                <h3 className="font-heading text-xl font-semibold mb-6">Order Summary</h3>
                
                {/* Cart Items Preview */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                        <p className="text-primary text-sm price-tag">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/50 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal</span>
                    <span className="text-foreground price-tag">{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Shipping</span>
                    <span className="text-foreground">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Tax (GST 18%)</span>
                    <span className="text-foreground price-tag">{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-lg">Total</span>
                    <span className="font-heading text-2xl text-primary price-tag" data-testid="checkout-total">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground h-14 text-xs font-semibold tracking-widest uppercase hover:bg-accent rounded-none btn-press disabled:opacity-50"
                  data-testid="place-order-btn"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Button>

                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs mt-4">
                  <Lock className="w-3 h-3" />
                  <span>Secure checkout</span>
                </div>

                <p className="text-center text-muted-foreground text-xs mt-2">
                  Payment integration ready (Razorpay)
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
