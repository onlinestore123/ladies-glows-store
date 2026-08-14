"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerCity: "",
    customerAddress: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("سلتك فارغة");
      return;
    }
    if (!form.customerName || !form.customerPhone || !form.customerCity || !form.customerAddress) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            productNameAr: i.nameAr,
            quantity: i.quantity,
            price: i.price,
            image: i.image,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "تعذر إتمام الطلب");
      }

      setSuccess(true);
      clearCart();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ ما");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center px-6 py-24">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 size={64} className="text-brand-purple mx-auto mb-4" />
        </motion.div>
        <h1 className="font-display italic text-2xl font-bold text-brand-purple-dark mb-2">
          تم استلام طلبك بنجاح
        </h1>
        <p className="text-brand-purple-dark/60 mb-8">
          سنتواصل معك قريباً لتأكيد الطلب. الدفع عند الاستلام.
        </p>
        <button onClick={() => router.push("/products")} className="btn-primary">
          متابعة التسوّق
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center px-6 py-24 text-brand-purple-dark/50">
        <p className="font-display text-xl mb-2">سلتك فارغة</p>
        <button onClick={() => router.push("/products")} className="btn-secondary mt-4">
          تصفّحي المنتجات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display italic text-3xl font-bold text-brand-purple-dark mb-6">
        إتمام الطلب
      </h1>

      <div className="grid lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="card-surface p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">الاسم الكامل *</label>
              <input
                required
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                className="w-full h-12 rounded-xl border border-brand-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">رقم الهاتف *</label>
              <input
                required
                type="tel"
                inputMode="tel"
                value={form.customerPhone}
                onChange={(e) => update("customerPhone", e.target.value)}
                className="w-full h-12 rounded-xl border border-brand-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">المدينة *</label>
              <input
                required
                value={form.customerCity}
                onChange={(e) => update("customerCity", e.target.value)}
                className="w-full h-12 rounded-xl border border-brand-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">العنوان بالتفصيل *</label>
              <textarea
                required
                rows={3}
                value={form.customerAddress}
                onChange={(e) => update("customerAddress", e.target.value)}
                className="w-full rounded-xl border border-brand-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">ملاحظات (اختياري)</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="w-full rounded-xl border border-brand-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-brand-purple-dark/60 px-1">
            <Truck size={16} />
            الدفع عند الاستلام - لا حاجة لإنشاء حساب
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="card-surface p-5 sticky top-24">
            <h2 className="font-bold text-brand-purple-dark mb-4">ملخص الطلب</h2>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-brand-100 shrink-0">
                    <Image src={item.image} alt={item.nameAr} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-purple-dark line-clamp-1">{item.nameAr}</p>
                    <p className="text-xs text-brand-purple-dark/50">
                      {item.quantity} × {item.price.toLocaleString("ar")} دج
                    </p>
                  </div>
                  <p className="text-sm font-bold text-brand-purple whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString("ar")} دج
                  </p>
                </div>
              ))}
            </div>
            <div className="gold-divider mb-4" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-purple-dark">الإجمالي</span>
              <span className="font-display text-xl font-bold text-brand-purple">
                {total.toLocaleString("ar")} دج
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
