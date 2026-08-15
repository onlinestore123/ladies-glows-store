"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, ChevronRight, ChevronLeft, Leaf, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/db/schema";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const setBuyNow = useCartStore((s) => s.setBuyNow);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product ?? null);
        setActiveImage(0);
        setQty(1);
        if (data.product) {
          fetch("/api/products")
            .then((r) => r.json())
            .then((all) => {
              const list: Product[] = all.products ?? [];
              setRelated(
                list.filter((p) => p.category === data.product.category && p.id !== data.product.id).slice(0, 4)
              );
            });
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square rounded-3xl bg-brand-100" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-brand-100 rounded-full" />
          <div className="h-5 w-1/3 bg-brand-100 rounded-full" />
          <div className="h-24 bg-brand-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center px-6 py-24 text-brand-purple-dark/50">
        <p className="font-display text-xl mb-2">المنتج غير موجود</p>
      </div>
    );
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : 0;

  const cartPayload = () => ({
    productId: product.id,
    nameAr: product.nameAr,
    name: product.name,
    price: product.price,
    image: product.images?.[0] ?? "/logo.png",
    stock: product.stock,
  });

  const handleAdd = () => {
    if (product.stock <= 0) {
      toast.error("نفدت الكمية حالياً");
      return;
    }
    addItem(cartPayload(), qty);
    toast.success("تمت الإضافة إلى السلة");
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      toast.error("نفدت الكمية حالياً");
      return;
    }
    setBuyNow(cartPayload(), qty);
    router.push("/checkout");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-brand-100">
            {product.images?.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[activeImage]}
                    alt={product.nameAr}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-purple/30 font-display text-xl">
                Ladies Glows
              </div>
            )}

            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => (i - 1 + product.images.length) % product.images.length)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-brand-purple shadow"
                  aria-label="السابق"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i + 1) % product.images.length)}
                  className="absolute top-1/2 -translate-y-1/2 left-3 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-brand-purple shadow"
                  aria-label="التالي"
                >
                  <ChevronLeft size={20} />
                </button>
              </>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === activeImage ? "border-brand-purple" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {product.video && (
            <div className="mt-4 rounded-2xl overflow-hidden bg-black">
              <video
                src={product.video}
                controls
                playsInline
                preload="none"
                className="w-full aspect-video"
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.isNew && (
              <span className="px-2.5 py-1 rounded-full bg-brand-purple text-white text-xs font-bold">جديد</span>
            )}
            {product.isBestseller && (
              <span className="px-2.5 py-1 rounded-full bg-brand-gold text-brand-purple-dark text-xs font-bold">
                الأكثر مبيعاً
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-brand-pink text-white text-xs font-bold">
                خصم {discount}٪
              </span>
            )}
          </div>

          <h1 className="font-display italic text-3xl font-bold text-brand-purple-dark mb-2">
            {product.nameAr}
          </h1>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-3 text-brand-gold">
              <Star size={16} fill="currentColor" />
              <span className="text-sm text-brand-purple-dark/70">
                {product.rating.toFixed(1)} ({product.reviewCount} تقييم)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-2xl font-bold text-brand-purple">
              {product.price.toLocaleString("ar")} دج
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-brand-purple-dark/40 line-through">
                {product.originalPrice.toLocaleString("ar")} دج
              </span>
            )}
          </div>

          <p className="text-brand-purple-dark/70 leading-relaxed mb-5">{product.descriptionAr}</p>

          {product.ingredientsAr && (
            <div className="card-surface p-4 mb-5 flex gap-3">
              <Leaf size={20} className="text-brand-purple shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-brand-purple-dark mb-1">المكوّنات</p>
                <p className="text-sm text-brand-purple-dark/60 leading-relaxed">{product.ingredientsAr}</p>
              </div>
            </div>
          )}

          <p className="text-sm mb-5">
            {product.stock > 0 ? (
              <span className="text-green-600 font-bold">متوفر ({product.stock} قطعة)</span>
            ) : (
              <span className="text-brand-pink font-bold">غير متوفر حالياً</span>
            )}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-brand-100 px-2 h-12">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-brand-100 transition-colors"
                aria-label="إنقاص"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-brand-100 transition-colors"
                aria-label="زيادة"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              أضيفي إلى السلة
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Zap size={18} />
              اشترِ الآن
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display italic text-2xl font-bold text-brand-purple-dark mb-5">
            قد يعجبك أيضاً
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
