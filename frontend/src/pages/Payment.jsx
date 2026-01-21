import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart, cart } = useCart();
  const [processing, setProcessing] = useState(false);

  // If accessed directly without state, redirect to cart
  if (!state || !state.formData) {
    if (typeof window !== 'undefined') navigate('/cart');
    return null;
  }

  const { formData, cartId } = state;
  const total = cart.total;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Create order in backend (which saves to Excel)
      const orderResponse = await axios.post(`${API}/orders`, {
        customer: formData,
        cart_id: cartId
      });

      const orderId = orderResponse.data.id;

      // Clear cart
      clearCart();
      
      toast.success('Payment successful!');
      navigate(`/order-confirmation/${orderId}`);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="pt-20 min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <div className="bg-card border border-border/50 max-w-md w-full p-8 shadow-lg">
        <div className="text-center mb-8">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-semibold">Secure Payment</h1>
          <p className="text-muted-foreground text-sm mt-2">Completing your purchase</p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex justify-between items-center py-4 border-b border-border/50">
            <span className="text-muted-foreground">Amount to Pay</span>
            <span className="font-heading text-xl font-semibold">{formatPrice(total)}</span>
          </div>
          
          <div className="bg-secondary/50 p-4 rounded border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-foreground" />
              <span className="font-medium">Card Payment (Simulated)</span>
            </div>
            <p className="text-xs text-muted-foreground ml-8">
              This is a secure checkout simulation. No real money will be deducted.
            </p>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-primary text-primary-foreground h-14 text-sm font-semibold tracking-widest uppercase hover:bg-accent rounded-none btn-press disabled:opacity-70"
        >
          {processing ? 'Processing...' : `Pay ${formatPrice(total)}`}
        </Button>

        <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL Encrypted Connection</span>
        </div>
      </div>
    </div>
  );
};

export default Payment;
