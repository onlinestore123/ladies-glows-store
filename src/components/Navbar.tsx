"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, ExternalLink } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "كل المنتجات" },
  { href: "/products?category=face-care", label: "العناية بالوجه" },
  { href: "/products?category=hair-care", label: "العناية بالشعر" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_PANEL_URL;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden ring-1 ring-brand-gold/40 transition-shadow duration-300 group-hover:shadow-gold">
              <Image src="/logo.png" alt="Ladies Glows" fill sizes="48px" className="object-cover" priority />
            </span>
            <span className="font-display italic text-xl lg:text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
              Ladies Glows
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-brand-purple-dark/80 transition-all duration-200 hover:bg-brand-100 hover:text-brand-purple"
              >
                {link.label}
              </Link>
            ))}
            {adminUrl && (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-brand-purple-dark/50 hover:text-brand-purple transition-colors"
              >
                لوحة التاجر <ExternalLink size={14} />
              </a>
            )}
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/products" className="icon-btn" aria-label="بحث">
              <Search size={20} />
            </Link>
            <button onClick={openCart} className="icon-btn relative" aria-label="السلة">
              <ShoppingBag size={20} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-gradient text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="icon-btn lg:hidden"
              aria-label="القائمة"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden overflow-hidden border-t border-brand-100 bg-white"
          >
            <div className="flex flex-col p-3 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 min-h-[44px] flex items-center rounded-xl text-brand-purple-dark font-medium hover:bg-brand-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {adminUrl && (
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 min-h-[44px] flex items-center gap-1 rounded-xl text-brand-purple-dark/60 font-medium hover:bg-brand-100 transition-colors"
                >
                  لوحة التاجر <ExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
