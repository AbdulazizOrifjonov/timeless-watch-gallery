import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner Skeleton */}
      <div className="relative flex h-[200px] sm:h-[220px] items-center overflow-hidden bg-navy-950 p-6 animate-pulse">
        <div className="container-shop space-y-3">
          <div className="h-3 w-20 rounded bg-gold-400/30" />
          <div className="h-8 w-64 rounded bg-white/20" />
          <div className="h-4 w-96 max-w-full rounded bg-white/10" />
        </div>
      </div>

      <div className="container-shop grid grid-cols-1 gap-8 py-8 lg:grid-cols-[260px_1fr] lg:items-start">
        {/* Sidebar Skeleton (Desktop) */}
        <aside className="hidden lg:block space-y-6 animate-pulse">
          <div className="h-5 w-32 rounded bg-navy-100" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-navy-100/60" />
            ))}
          </div>
          <div className="h-5 w-24 rounded bg-navy-100 pt-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-3/4 rounded bg-navy-100/60" />
            ))}
          </div>
        </aside>

        {/* Products Grid Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between animate-pulse">
            <div className="h-6 w-36 rounded bg-navy-100" />
            <div className="h-8 w-24 rounded bg-navy-100" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
