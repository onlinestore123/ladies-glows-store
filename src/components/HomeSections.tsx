"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/db/schema";

const WHY_US = [
  {
    icon: Leaf,
    title: "مكوّنات طبيعية 100٪",
    text: "نختار مكوّناتنا بعناية من مصادر طبيعية موثوقة، بعيداً عن المواد الكيميائية القاسية.",
  },
  {
    icon: Truck,
    title: "توصيل سريع لباب المنزل",
    text: "نوصل طلبك أينما كنتِ، مع خيار الدفع عند الاستلام لراحتك التامة.",
  },
  {
    icon: ShieldCheck,
    title: "فعالية مثبتة",
    text: "منتجات مدروسة ومجرّبة لتمنحك نتائج تشعرين بها وتلاحظينها فعلاً.",
  },
];

export default function HomeSections() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-3 gap-5">
          {WHY_US.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-surface p-6 text-center flex flex-col items-center gap-3"
            >
              <span className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white">
                <item.icon size={22} />
              </span>
              <h3 className="font-bold text-brand-purple-dark">{item.title}</h3>
              <p className="text-sm text-brand-purple-dark/60 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {!loading && featured.length > 0 && (
        <ProductSection title="منتجات مميزة" products={featured} href="/products" />
      )}

      {!loading && newArrivals.length > 0 && (
        <ProductSection title="وصل حديثاً" products={newArrivals} href="/products" alt />
      )}

      {!loading && products.length === 0 && (
        <div className="max-w-md mx-auto text-center px-6 py-20 text-brand-purple-dark/50">
          <p className="font-display text-xl mb-2">لا توجد منتجات بعد</p>
          <p className="text-sm">سيتم عرض المنتجات هنا فور إضافتها من لوحة التحكم.</p>
        </div>
      )}
    </>
  );
}

function ProductSection({
  title,
  products,
  href,
  alt,
}: {
  title: string;
  products: Product[];
  href: string;
  alt?: boolean;
}) {
  return (
    <section className={`py-12 ${alt ? "bg-white/60" : ""}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display italic text-2xl sm:text-3xl font-bold text-brand-purple-dark">
            {title}
          </h2>
          <Link
            href={href}
            className="flex items-center gap-1 text-sm font-bold text-brand-purple hover:gap-2 transition-all"
          >
            عرض الكل <ArrowLeft size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
