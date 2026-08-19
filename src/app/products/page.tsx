"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/db/schema";

const CATEGORIES = [
  { slug: "all", label: "الكل", icon: "✨" },
  { slug: "face-care", label: "العناية بالوجه", icon: "✨" },
  { slug: "body-care", label: "العناية بالجسم", icon: "🌿" },
  { slug: "hair-care", label: "العناية بالشعر", icon: "💆" },
  { slug: "serums-oils", label: "السيروم والزيوت", icon: "💧" },
  { slug: "masks", label: "الأقنعة", icon: "🌸" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" },
  { value: "rating", label: "الأعلى تقييماً" },
  { value: "name", label: "الاسم" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [priceRange, setPriceRange] = useState(10000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const list: Product[] = data.products ?? [];
        setProducts(list);
        const highest = Math.max(...list.map((p) => p.price), 1000);
        setMaxPrice(highest);
        setPriceRange(highest);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q)
      );
    }

    result = result.filter((p) => p.price <= priceRange);

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result.sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
        break;
      default:
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [products, category, search, sort, priceRange]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display italic text-3xl font-bold text-brand-purple-dark mb-6">
        كل المنتجات
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-brand-purple-dark/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحثي عن منتج..."
            className="w-full h-12 rounded-full border border-brand-100 bg-white pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 transition-shadow"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-brand-100 bg-white text-sm font-bold text-brand-purple-dark sm:hidden"
        >
          <SlidersHorizontal size={16} /> فلترة وترتيب
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="hidden sm:block h-12 rounded-full border border-brand-100 bg-white px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden sm:hidden mb-4"
          >
            <div className="card-surface p-4 space-y-3">
              <label className="text-sm font-bold text-brand-purple-dark">الترتيب حسب</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full h-11 rounded-xl border border-brand-100 px-3 text-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <label className="text-sm font-bold text-brand-purple-dark">
                السعر الأقصى: {priceRange.toLocaleString("en-US")} دج
              </label>
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-purple"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-full text-sm font-bold border transition-all duration-200 ${
              category === cat.slug
                ? "bg-brand-gradient text-white border-transparent shadow-brand"
                : "bg-white text-brand-purple-dark/70 border-brand-100 hover:border-brand-purple/30"
            }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-3 mb-6 max-w-xs">
        <span className="text-xs font-bold text-brand-purple-dark/60 whitespace-nowrap">
          حتى {priceRange.toLocaleString("en-US")} دج
        </span>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="flex-1 accent-brand-purple"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4.2] rounded-2xl bg-brand-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-brand-purple-dark/50">
          <p className="font-display text-xl mb-2">لا توجد نتائج</p>
          <p className="text-sm">جرّبي تغيير كلمات البحث أو الفلاتر.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
