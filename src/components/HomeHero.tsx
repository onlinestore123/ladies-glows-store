"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Product } from "@/db/schema";

export default function HomeHero() {
  const [slides, setSlides] = useState<Product[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const featured = (data.products ?? []).filter(
          (p: Product) => p.featured && p.images?.length
        );
        setSlides(featured.slice(0, 5));
      })
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden bg-brand-gradient-soft">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-purple/10 blur-3xl animate-floatSlow" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-brand-gold/20 blur-3xl animate-floatSlow" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-24 grid lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center lg:text-right order-2 lg:order-1"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 text-xs font-bold text-brand-purple mb-4 shadow-sm">
            <Sparkles size={14} className="text-brand-gold" />
            عناية طبيعية 100٪
          </span>
          <h1 className="font-display italic text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-purple-dark leading-tight mb-4">
            توهّجك الطبيعي يبدأ من هنا
          </h1>
          <p className="text-brand-purple-dark/70 text-base sm:text-lg max-w-md mx-auto lg:mx-0 mb-7">
            منتجات عناية طبيعية للوجه والجسم والشعر، مصنوعة بعناية لتبرز جمالك الحقيقي.
          </p>
          <Link href="/products" className="btn-primary text-base">
            تسوّقي الآن
            <ArrowLeft size={18} />
          </Link>
        </motion.div>

        <div className="relative order-1 lg:order-2 aspect-square max-w-sm mx-auto w-full">
          <div className="absolute inset-0 rounded-[2.5rem] bg-white/40 shadow-brand" />
          <div className="absolute inset-3 rounded-[2rem] overflow-hidden">
            {slides.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={slides[active]?.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={slides[active].images[0]}
                    alt={slides[active].nameAr}
                    fill
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-brand-purple-dark/70 to-transparent p-5">
                    <p className="text-white font-bold">{slides[active].nameAr}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-100">
                <Image src="/logo.png" alt="Ladies Glows" width={140} height={140} className="rounded-full opacity-70" />
              </div>
            )}
          </div>

          {slides.length > 1 && (
            <div className="absolute -bottom-6 inset-x-0 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`الشريحة ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? "w-6 bg-brand-purple" : "w-1.5 bg-brand-purple/25"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
