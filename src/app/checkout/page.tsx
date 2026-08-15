"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Truck, Store, Building2, Home } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore, type CartItem } from "@/store/cartStore";
import { WILAYAS } from "@/lib/wilayas";
import type { PublicSettings } from "@/lib/settings";
import type { DeliveryMethod } from "@/lib/wilayas";

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, totalPrice, clearCart, buyNowItem, clearBuyNow } = useCartStore();

  // إذا جاء الزبون من زر "اشترِ الآن"، نستخدم هذا المنتج فقط بدل محتوى السلة كاملاً
  const items: CartItem[] = buyNowItem ? [buyNowItem] : cartItems;
  const itemsTotal = buyNowItem ? buyNowItem.price * buyNowItem.quantity : totalPrice();

  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });
  const [wilayaCode, setWilayaCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("home");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings ?? null))
      .catch(() => setSettings(null));
  }, []);

  const deliveryPrice = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (!wilayaCode || !settings) return 0;
    const pricing = settings.wilayaPricing[wilayaCode];
    if (!pricing) return 0;
    return deliveryMethod === "desk" ? pricing.desk : pricing.home;
  }, [deliveryMethod, wilayaCode, settings]);

  const total = itemsTotal + deliveryPrice;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("سلتك فارغة");
      return;
    }
    if (!form.customerName || !form.customerPhone) {
      toast.error("يرجى تعبئة الاسم ورقم الهاتف");
      return;
    }
    if (deliveryMethod !== "pickup" && (!wilayaCode || !form.customerAddress)) {
      toast.error("يرجى اختيار الولاية وإدخال العنوان");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerAddress: deliveryMethod === "pickup" ? null : form.customerAddress,
          notes: form.notes,
          deliveryMethod,
          wilayaCode: deliveryMethod === "pickup" ? null : wilayaCode,
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
      if (buyNowItem) clearBuyNow();
      else clearCart();
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
          </div>

          {/* طريقة التوصيل */}
          <div className="card-surface p-5 space-y-3">
            <p className="text-sm font-bold text-brand-purple-dark mb-1">طريقة الاستلام</p>

            <div className="grid sm:grid-cols-3 gap-2">
              <DeliveryOption
                icon={<Building2 size={18} />}
                label="توصيل للمكتب"
                active={deliveryMethod === "desk"}
                onClick={() => setDeliveryMethod("desk")}
              />
              <DeliveryOption
                icon={<Home size={18} />}
                label="توصيل للمنزل"
                active={deliveryMethod === "home"}
                onClick={() => setDeliveryMethod("home")}
              />
              {settings?.pickupEnabled && (
                <DeliveryOption
                  icon={<Store size={18} />}
                  label="استلام من المتجر"
                  active={deliveryMethod === "pickup"}
                  onClick={() => setDeliveryMethod("pickup")}
                />
              )}
            </div>

            {deliveryMethod === "pickup" ? (
              settings?.pickupAddress && (
                <p className="text-sm text-brand-purple-dark/70 bg-brand-50 rounded-xl p-3 mt-2">
                  عنوان الاستلام: {settings.pickupAddress}
                </p>
              )
            ) : (
              <>
                <div className="mt-2">
                  <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">الولاية *</label>
                  <select
                    required
                    value={wilayaCode}
                    onChange={(e) => setWilayaCode(e.target.value)}
                    className="w-full h-12 rounded-xl border border-brand-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-white"
                  >
                    <option value="">اختاري الولاية...</option>
                    {WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
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
                {wilayaCode && (
                  <p className="text-sm text-brand-purple font-bold">
                    سعر التوصيل: {deliveryPrice.toLocaleString("ar")} دج
                  </p>
                )}
              </>
            )}
          </div>

          <div className="card-surface p-5">
            <label className="block text-sm font-bold text-brand-purple-dark mb-1.5">ملاحظات (اختياري)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="w-full rounded-xl border border-brand-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none"
            />
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
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-brand-purple-dark/70">
                <span>المجموع الفرعي</span>
                <span>{itemsTotal.toLocaleString("ar")} دج</span>
              </div>
              <div className="flex items-center justify-between text-brand-purple-dark/70">
                <span>التوصيل</span>
                <span>{deliveryMethod === "pickup" ? "مجاني" : `${deliveryPrice.toLocaleString("ar")} دج`}</span>
              </div>
            </div>
            <div className="gold-divider my-4" />
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

function DeliveryOption({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-colors duration-150 ${
        active
          ? "border-brand-purple bg-brand-purple/5 text-brand-purple"
          : "border-brand-100 text-brand-purple-dark/60 hover:border-brand-purple/30"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
