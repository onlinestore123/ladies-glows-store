"use client";

import { Toaster } from "react-hot-toast";
import CartSidebar from "./CartSidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CartSidebar />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#3d1a5c",
            border: "1px solid #f3edff",
            borderRadius: "16px",
            padding: "12px 18px",
            fontFamily: "var(--font-tajawal)",
            boxShadow: "0 10px 30px -10px rgba(147,51,234,0.35)",
          },
          success: { iconTheme: { primary: "#9333ea", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ec4899", secondary: "#fff" } },
        }}
      />
    </>
  );
}
