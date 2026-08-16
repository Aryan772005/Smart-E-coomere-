"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { useCart } from "@/components/common/CartDrawer";
import { Button } from "@/components/ui/Button";
import { 
  CreditCard, 
  Wallet, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Smartphone, 
  Building2, 
  ArrowLeft,
  ChevronRight,
  Truck
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, rawTotal = 0, discountAmount = 0, clearCart } = useCart();
  
  const [step, setStep] = useState<"address" | "payment">("address");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    addressLine1: "",
    city: "",
    state: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem("access_token"); // Or however auth token is retrieved
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const payload = {
        full_name: address.fullName,
        phone: address.phone,
        address_line_1: address.addressLine1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        payment_method: paymentMethod,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const res = await fetch("https://reloqa-backend.onrender.com/api/v1/orders/", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error("Failed to place order");
      }
      
      // Clear cart
      clearCart();
      localStorage.removeItem("tariani_cart");
      
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while placing the order. Are you logged in?");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center mb-6">
            <Truck className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-800">Your Cart is Empty</h1>
          <p className="mt-2 text-slate-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => router.push("/")} size="lg">Start Shopping</Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border border-slate-800 p-10 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Confetti / Success Glow */}
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-brand/30 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-blue-500/30 blur-[80px] rounded-full" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto h-20 w-20 bg-brand/20 rounded-full flex items-center justify-center mb-6 border border-brand/50"
            >
              <CheckCircle2 className="h-10 w-10 text-brand" />
            </motion.div>
            
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Order Confirmed!</h1>
            <p className="text-slate-400 text-sm mb-6">
              Thank you for choosing Singh Sellers. Your order <strong className="text-white">#ORD-{Math.floor(Math.random() * 1000000)}</strong> has been placed securely and is being processed.
            </p>
            
            <div className="bg-slate-950 rounded-xl p-4 mb-8 text-left border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Delivery To</p>
              <p className="text-sm font-semibold text-white">{address.fullName || "Valued Customer"}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{address.addressLine1 || "Shipping Address"}, {address.city}, {address.pincode}</p>
            </div>
            
            <Button onClick={() => window.location.href = "/"} fullWidth size="lg">Return to Home</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate actual total from CartDrawer (recomputing in case they are missing in context)
  const calcRawTotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const calcTotal = calcRawTotal; // Add tax/shipping logic here if needed

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-brand selection:text-brand-foreground flex flex-col">
      {/* Checkout Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-black transition-colors" />
            <span className="font-black text-xl tracking-tighter text-black uppercase">
              SINGH<span className="text-brand">SELLERS</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Lock className="h-3.5 w-3.5" /> Secure Checkout
          </div>
        </div>
      </header>

      <main className="flex-1 container-page py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Forms */}
          <div className="flex-1 max-w-3xl">
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
              <div className={`flex items-center gap-2 ${step === "address" ? "text-brand" : "text-slate-400"}`}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === "address" ? "bg-brand text-brand-foreground" : "bg-slate-200 text-slate-500"}`}>1</div>
                <span className="text-sm font-bold uppercase tracking-wider">Delivery</span>
              </div>
              <div className="h-px w-8 bg-slate-200" />
              <div className={`flex items-center gap-2 ${step === "payment" ? "text-brand" : "text-slate-400"}`}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === "payment" ? "bg-brand text-brand-foreground" : "bg-slate-200 text-slate-500"}`}>2</div>
                <span className="text-sm font-bold uppercase tracking-wider">Payment</span>
              </div>
            </div>

            {/* Step 1: Address Form */}
            {step === "address" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand" /> Shipping Details
                </h2>
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                      <input required type="text" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                      <input required type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Address Line 1</label>
                    <input required type="text" value={address.addressLine1} onChange={e => setAddress({...address, addressLine1: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="House No, Building, Street Area" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pincode</label>
                      <input required type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="400001" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">City</label>
                      <input required type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="Mumbai" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">State</label>
                      <input required type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" placeholder="Maharashtra" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button type="submit" size="lg" rightIcon={<ChevronRight className="h-4 w-4" />}>Continue to Payment</Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-brand" /> Payment Method
                  </h2>
                  <button onClick={() => setStep("address")} className="text-xs font-bold text-slate-400 hover:text-brand transition-colors uppercase">
                    Edit Address
                  </button>
                </div>

                <div className="space-y-3 mb-8">
                  {/* Card Option */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-brand bg-brand/5' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-brand' : 'border-slate-300'}`}>
                      {paymentMethod === 'card' && <div className="h-2.5 w-2.5 rounded-full bg-brand" />}
                    </div>
                    <CreditCard className={`h-6 w-6 ${paymentMethod === 'card' ? 'text-brand' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">Credit / Debit Card</p>
                      <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
                    </div>
                  </label>

                  {/* UPI Option */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-brand bg-brand/5' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-brand' : 'border-slate-300'}`}>
                      {paymentMethod === 'upi' && <div className="h-2.5 w-2.5 rounded-full bg-brand" />}
                    </div>
                    <Smartphone className={`h-6 w-6 ${paymentMethod === 'upi' ? 'text-brand' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">UPI</p>
                      <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </label>

                  {/* COD Option */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-brand bg-brand/5' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-brand' : 'border-slate-300'}`}>
                      {paymentMethod === 'cod' && <div className="h-2.5 w-2.5 rounded-full bg-brand" />}
                    </div>
                    <Wallet className={`h-6 w-6 ${paymentMethod === 'cod' ? 'text-brand' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">Cash on Delivery</p>
                      <p className="text-xs text-slate-500">Pay when you receive your order</p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button 
                    onClick={handlePlaceOrder} 
                    fullWidth 
                    size="lg" 
                    isLoading={isProcessing}
                    rightIcon={!isProcessing ? <Lock className="h-4 w-4" /> : undefined}
                  >
                    {isProcessing ? "Processing Securely..." : `Pay ₹${calcTotal.toLocaleString("en-IN")}`}
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure 256-bit SSL Encryption
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-6 border-b border-slate-100 pb-4">
                Order Summary
              </h3>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">{item.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{calcRawTotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-500">Free</span>
                </div>
                
                <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-base font-black uppercase tracking-tight text-slate-900">Total</span>
                  <span className="text-xl font-black text-brand">₹{calcTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
