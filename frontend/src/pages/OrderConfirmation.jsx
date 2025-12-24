import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, Truck, Home as HomeIcon } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API}/orders/${orderId}`);
        setOrder(res.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-4">Order Not Found</h2>
          <p className="text-muted-foreground mb-8">We couldn't find the order you're looking for.</p>
          <Link 
            to="/products"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-accent transition-all btn-press"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { icon: CheckCircle, label: 'Order Placed', active: true },
    { icon: Package, label: 'Processing', active: false },
    { icon: Truck, label: 'Shipped', active: false },
    { icon: HomeIcon, label: 'Delivered', active: false },
  ];

  return (
    <div className="pt-20 min-h-screen" data-testid="order-confirmation-page">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Message */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-muted-foreground text-lg">
            Your order has been placed successfully.
          </p>
          <p className="text-primary mt-2" data-testid="order-id">
            Order ID: {order.id}
          </p>
        </div>

        {/* Order Progress */}
        <div className="bg-card border border-border/50 p-6 md:p-8 mb-8">
          <h2 className="font-heading text-xl font-semibold mb-8 text-center">Order Status</h2>
          <div className="flex justify-between items-center relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary" style={{ width: '5%' }} />
            
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.active ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 ${step.active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="bg-card border border-border/50 p-6">
            <h3 className="font-heading text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                    <p className="text-primary text-sm price-tag">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 mt-4 pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary price-tag">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card border border-border/50 p-6">
            <h3 className="font-heading text-lg font-semibold mb-4">Shipping Address</h3>
            <div className="text-muted-foreground space-y-1">
              <p className="text-foreground font-medium">{order.customer.full_name}</p>
              <p>{order.customer.address}</p>
              <p>{order.customer.city}, {order.customer.state}</p>
              <p>{order.customer.pincode}</p>
              <p className="pt-2">{order.customer.phone}</p>
              <p>{order.customer.email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link 
            to="/products"
            className="bg-primary text-primary-foreground px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-accent transition-all btn-press text-center"
            data-testid="continue-shopping-btn"
          >
            Continue Shopping
          </Link>
          <Link 
            to="/"
            className="bg-transparent border border-primary/30 text-primary px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:border-primary hover:bg-primary/5 transition-all text-center"
            data-testid="home-btn"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
