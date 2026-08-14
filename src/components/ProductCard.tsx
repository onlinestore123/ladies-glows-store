"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/db/schema";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error("نفدت الكمية حالياً");
      return;
    }
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? "/logo.png",
      stock: product.stock,
    });
    toast.success("تمت الإضافة إلى السلة");
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/products/${product.id}`} className="card-surface group flex flex-col h-full overflow-hidden">
        <div className="relative aspect-square bg-brand-100 overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.nameAr}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-purple/30 font-display text-lg">
              Ladies Glows
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-start">
            {product.isNew && (
              <span className="px-2.5 py-1 rounded-full bg-brand-purple text-white text-[11px] font-bold shadow-sm">
                جديد
              </span>
            )}
            {product.isBestseller && (
              <span className="px-2.5 py-1 rounded-full bg-brand-gold text-brand-purple-dark text-[11px] font-bold shadow-sm">
                الأكثر مبيعاً
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-brand-pink text-white text-[11px] font-bold shadow-sm">
                خصم {discount}٪
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            aria-label="أضف إلى السلة"
            className="absolute bottom-2 left-2 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-brand-purple shadow-md transition-all duration-200 hover:bg-brand-gradient hover:text-white active:scale-90"
          >
            <ShoppingBag size={18} />
          </button>
        </div>

        <div className="p-3.5 flex flex-col gap-1.5 flex-1">
          <h3 className="font-body font-bold text-sm text-brand-purple-dark line-clamp-1">
            {product.nameAr}
          </h3>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-brand-gold">
              <Star size={13} fill="currentColor" />
              <span className="text-brand-purple-dark/60">
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="mt-auto flex items-baseline gap-2">
            <span className="font-bold text-brand-purple">{product.price.toLocaleString("ar")} دج</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-brand-purple-dark/40 line-through">
                {product.originalPrice.toLocaleString("ar")} دج
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
