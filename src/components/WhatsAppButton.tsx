"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string | null }) {
  if (!whatsappNumber) return null;

  // ينظّف الرقم من أي رموز غير أرقام (يُفترض إدخاله بالصيغة الدولية مثل 213XXXXXXXXX من الإعدادات)
  const digits = whatsappNumber.replace(/[^\d]/g, "");
  if (!digits) return null;

  return (
    <motion.a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصلي معنا عبر واتساب"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed z-40 bottom-20 left-4 lg:bottom-6 lg:left-6 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center"
    >
      <MessageCircle size={26} fill="white" />
    </motion.a>
  );
}
