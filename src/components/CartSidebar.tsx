"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartSidebar() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } = useCartStore();
  const total = totalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-brand-purple-dark/40 backdrop-blur-sm z-50"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[420px] bg-brand-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100 bg-white">
              <h2 className="font-display text-xl font-bold text-brand-purple">سلة المشتريات</h2>
              <button onClick={closeCart} className="icon-btn" aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-brand-purple-dark/50 px-6">
                <ShoppingBag size={48} strokeWidth={1.5} />
                <p className="font-medium">سلتك فارغة حالياً</p>
                <Link href="/products" onClick={closeCart} className="btn-secondary mt-2">
                  تصفّحي المنتجات
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.variant ?? ""}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="flex gap-3 bg-white rounded-2xl p-3 border border-brand-100"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-brand-100 shrink-0">
                        <Image src={item.image} alt={item.nameAr} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <p className="text-sm font-bold text-brand-purple-dark line-clamp-1">{item.nameAr}</p>
                        {item.variant && (
                          <p className="text-xs text-brand-purple-dark/50">الخيار: {item.variant}</p>
                        )}
                        <p className="text-xs text-brand-purple">{item.price.toLocaleString("en-US")} دج</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                            className="w-7 h-7 rounded-full border border-brand-100 flex items-center justify-center hover:bg-brand-100 transition-colors"
                            aria-label="إنقاص الكمية"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 rounded-full border border-brand-100 flex items-center justify-center hover:bg-brand-100 transition-colors disabled:opacity-30"
                            aria-label="زيادة الكمية"
                          >
                            <Plus size={13} />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.variant)}
                            className="ms-auto w-7 h-7 rounded-full flex items-center justify-center text-brand-pink hover:bg-brand-pink/10 transition-colors"
                            aria-label="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-brand-100 bg-white px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-brand-purple-dark/70">الإجمالي</span>
                    <span className="font-display text-xl font-bold text-brand-purple">
                      {total.toLocaleString("en-US")} دج
                    </span>
                  </div>
                  <Link href="/checkout" onClick={closeCart} className="btn-primary w-full">
                    إتمام الطلب
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
