import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      {/* Top Header Skeleton */}
      <div className="h-16 sm:h-20 border-b border-navy-100/70 bg-white/80 backdrop-blur px-4 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-navy-100" />
          <div className="h-5 w-32 rounded-md bg-navy-100" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="h-4 w-16 rounded bg-navy-100" />
          <div className="h-4 w-20 rounded bg-navy-100" />
          <div className="h-4 w-24 rounded bg-navy-100" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-navy-100" />
          <div className="h-9 w-9 rounded-full bg-navy-100" />
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <div className="container-shop py-6">
        <div className="relative h-[220px] sm:h-[360px] md:h-[440px] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-6 flex flex-col justify-end animate-pulse">
          <div className="h-4 w-32 rounded bg-gold-400/30 mb-3" />
          <div className="h-8 sm:h-12 w-2/3 max-w-lg rounded-lg bg-white/20 mb-3" />
          <div className="h-4 w-1/2 max-w-sm rounded bg-white/10 mb-6" />
          <div className="h-11 w-36 rounded-xl bg-gold-400/40" />
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      </div>

      {/* Categories Bar Skeleton */}
      <div className="container-shop py-4">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-navy-100" />
              <div className="h-3 w-16 rounded bg-navy-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container-shop py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-48 rounded bg-navy-200" />
          <div className="h-4 w-20 rounded bg-navy-100" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
