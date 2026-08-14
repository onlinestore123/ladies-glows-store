import type { Metadata } from "next";
import { Tajawal, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileTabBar from "@/components/MobileTabBar";
import Providers from "@/components/Providers";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ladies Glows | منتجات العناية الطبيعية للمرأة",
  description:
    "Ladies Glows - متجر متخصص في منتجات العناية الطبيعية للبشرة والجسم والشعر: سيروم، زيوت، وأقنعة طبيعية 100%.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Ladies Glows",
    description: "منتجات العناية الطبيعية للمرأة - Ladies Glows",
    images: ["/opengraph-image.png"],
    locale: "ar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${playfair.variable}`}>
      <body className="font-body min-h-screen flex flex-col bg-brand-50 antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <footer className="border-t border-brand-100 bg-white/60 py-10 mt-16 pb-24 lg:pb-10">
            <div className="max-w-6xl mx-auto px-6 text-center text-sm text-brand-purple-dark/70 font-body space-y-3">
              <p className="font-display text-lg text-brand-purple">Ladies Glows</p>
              <p>جمالك الطبيعي، عنايتنا الصادقة.</p>
              <p dir="ltr" className="tracking-wide">+213 000 000 000 · contact@ladiesglows.com</p>
              {process.env.NEXT_PUBLIC_ADMIN_PANEL_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_ADMIN_PANEL_URL}
                  className="inline-block text-xs text-brand-purple/60 hover:text-brand-purple underline underline-offset-4 transition-colors"
                >
                  دخول التاجر
                </a>
              )}
            </div>
          </footer>
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
