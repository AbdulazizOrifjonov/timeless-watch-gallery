"use client";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container-shop py-16"><h1 className="font-serif text-3xl font-bold text-navy-900">Sahifa</h1></div>
      <Footer />
    </div>
  );
}
