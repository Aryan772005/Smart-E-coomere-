"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { 
  Package, 
  ShoppingBag,
  MapPin,
  CreditCard,
  Clock,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface OrderItem {
  id: number;
  product: number | null;
  product_title: string;
  price: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  full_name: string;
  address_line_1: string;
  city: string;
  payment_method: string;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem("reloqa_access_token");
    if (!token) {
      router.push("/login?redirect=/orders");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("https://reloqa-backend.onrender.com/api/v1/orders/", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          // DRF uses pagination, so the array is in data.results
          setOrders(data.results || data);
        } else {
          console.error("Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container-page py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">My Orders</h1>
              <p className="text-sm text-slate-500">Track and manage your recent purchases</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-brand animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">No orders found</h2>
              <p className="text-slate-500 mb-6">Looks like you haven't made any purchases yet.</p>
              <Button onClick={() => router.push("/")}>Start Shopping</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={order.id} 
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-slate-50 border-b border-slate-200 p-5 lg:p-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Order Placed</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total</p>
                        <p className="text-sm font-semibold text-slate-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Order ID</p>
                        <p className="text-sm font-semibold text-slate-900">#ORD-{order.id.toString().padStart(6, '0')}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Body */}
                  <div className="p-5 lg:p-6">
                    {/* Items */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-4 items-center">
                          <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                            <Package className="h-6 w-6 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={item.product ? `/product/${item.product}` : "#"} className="text-sm font-bold text-brand hover:underline line-clamp-1">
                              {item.product_title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Delivery & Payment Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 mb-1">Delivery Address</p>
                          <p className="text-xs text-slate-500">{order.full_name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{order.address_line_1}, {order.city}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 mb-1">Payment Method</p>
                          <p className="text-xs text-slate-500 uppercase">{order.payment_method}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
