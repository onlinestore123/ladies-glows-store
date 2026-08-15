"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, ShoppingBag, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/db/schema";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const setBuyNow = useCartStore((s) => s.setBuyNow);
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

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error("نفدت الكمية حالياً");
      return;
    }
    addItem(cartPayload());
    toast.success("تمت الإضافة إلى السلة");
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error("نفدت الكمية حالياً");
      return;
    }
    setBuyNow(cartPayload());
    router.push("/checkout");
  };

  return (
    <div className="card-surface group flex flex-col h-full overflow-hidden">
      {/* Image area: its own link, button is a sibling (not nested inside the <a>) */}
      <div className="relative aspect-square bg-brand-100 overflow-hidden">
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-0">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.nameAr}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-purple/30 font-display text-lg">
              Ladies Glows
            </div>
          )}
        </Link>

        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
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
          type="button"
          onClick={handleAdd}
          aria-label="أضف إلى السلة"
          className="absolute bottom-2 left-2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-brand-purple shadow-md transition-colors duration-150 hover:bg-brand-gradient hover:text-white active:scale-90"
        >
          <ShoppingBag size={18} />
        </button>
      </div>

      {/* Text area: separate link to the same product, sibling of the image link */}
      <Link href={`/products/${product.id}`} className="p-3.5 flex flex-col gap-1.5 flex-1">
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
      </Link>

      <div className="px-3.5 pb-3.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="flex items-center justify-center gap-1.5 h-9 rounded-full border border-brand-purple/30 text-brand-purple text-xs font-bold transition-colors duration-150 hover:bg-brand-purple/10 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ShoppingBag size={14} />
          أضف للسلة
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={product.stock <= 0}
          className="flex items-center justify-center gap-1.5 h-9 rounded-full bg-brand-gradient text-white text-xs font-bold shadow-sm transition-transform duration-150 hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Zap size={14} />
          اشترِ الآن
        </button>
      </div>
    </div>
  );
}
