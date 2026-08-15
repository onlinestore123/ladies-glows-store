"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Grid3x3, ShoppingBag, Search } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function MobileTabBar() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const tabs = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/products", label: "المنتجات", icon: Grid3x3 },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-brand-100"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium"
          >
            <Icon
              size={22}
              className={isActive(href) ? "text-brand-purple" : "text-brand-purple-dark/40"}
            />
            <span className={isActive(href) ? "text-brand-purple" : "text-brand-purple-dark/40"}>
              {label}
            </span>
            {isActive(href) && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-gradient"
              />
            )}
          </Link>
        ))}

        <button
          onClick={openCart}
          className="relative flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium text-brand-purple-dark/40"
        >
          <span className="relative">
            <ShoppingBag size={22} />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -left-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-gradient text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          السلة
        </button>

        <Link
          href="/products"
          className="flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium text-brand-purple-dark/40"
        >
          <Search size={22} />
          بحث
        </Link>
      </div>
    </nav>
  );
}
