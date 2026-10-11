import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";

import { ToastProvider } from "@/context/ToastContext";
import { MobileBottomNav } from "@/components/shop/MobileBottomNav";
import { TelegramFloatingButton } from "@/components/shop/TelegramFloatingButton";

export const metadata: Metadata = {
  title: "Timeless — The Watch Gallery | Eksklyuziv soatlar galereyasi",
  description:
    "Timeless The Watch Gallery — Original va hashamatli soatlar galereyasi. Premium erkaklar va ayollar soatlari to'plami, rasmiy kafolat va tezkor yetkazib berish.",
  icons: {
    icon: [
      { url: "/icon.png?v=t-gold", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32x32.png?v=t-gold", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=t-gold", type: "image/png", sizes: "16x16" },
      { url: "/favicon.ico?v=t-gold", sizes: "any" },
      { url: "/icon-192.png?v=t-gold", type: "image/png", sizes: "192x192" },
    ],
    shortcut: ["/icon.png?v=t-gold"],
    apple: [
      { url: "/apple-touch-icon.png?v=t-gold", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/icon.png?v=t-gold" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=t-gold" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=t-gold" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=t-gold" />
        <link rel="shortcut icon" type="image/png" href="/icon.png?v=t-gold" />
        <link rel="icon" href="/favicon.ico?v=t-gold" sizes="any" />
        <meta name="theme-color" content="#2A160F" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#FCFAF7] text-navy-900" suppressHydrationWarning>
        <ToastProvider>
          <StoreProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <div className="pb-24 md:pb-0">{children}</div>
                  </Suspense>
                  <MobileBottomNav />
                  <TelegramFloatingButton />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}