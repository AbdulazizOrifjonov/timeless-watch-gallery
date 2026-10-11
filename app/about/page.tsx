"use client";
import { Suspense } from "react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";

function HeaderWithSuspense() {
  return <Header active="/about" />;
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Suspense fallback={<div className="h-[76px]" />}>
        <HeaderWithSuspense />
      </Suspense>
      <div className="container-shop py-16 max-w-3xl">
        <h1 className="font-serif text-4xl font-bold text-navy-900 mb-4">Galereya haqida</h1>
        <div className="space-y-5 text-navy-900/80 leading-relaxed text-base">
          <p>
            <strong>Timeless — The Watch Gallery</strong> — o'zida nafislik, aniqlik va abadiy uslubni mujassam etgan eksklyuziv soatlar galereyasi. Biz dunyoning afsonaviy Shveytsariya va Yaponiya soatsozlik uylarining eng sara original modellarini qadrlovchilar uchun taqdim etamiz.
          </p>
          <p>
            Bizning to'plamimizda Rolex, Patek Philippe, Cartier, Omega, TAG Heuer, Tissot, Seiko va boshqa nufuzli brendlarning mexanik, avtomatik va kvars soatlari o'rin olgan. Har bir soat o'zining rasmiy xalqaro hujjatlari va original qutisiga ega.
          </p>
          <p>
            Bizning maqsadimiz — har bir mijozga nafaqat vaqtni ko'rsatuvchi vosita, balki ularning yuksak mavqei va betakror didini namoyon etuvchi san'at asarini taqdim etishdir.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
