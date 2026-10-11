export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar Placeholder */}
      <div className="h-16 border-b border-navy-100/70 bg-white px-4" />

      <div className="container-shop py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Gallery Skeleton */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 animate-pulse">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:w-20 xl:w-24 shrink-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-square w-20 shrink-0 rounded-lg bg-navy-100" />
              ))}
            </div>
            <div className="relative aspect-square w-full flex-1 rounded-2xl bg-gradient-to-br from-navy-100/80 via-navy-50/60 to-navy-100/80 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-2 border-navy-200/50 flex items-center justify-center opacity-30">
                <div className="h-4 w-4 rounded-full bg-navy-300" />
              </div>
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-navy-100" />
              <div className="h-8 w-3/4 rounded-lg bg-navy-200" />
              <div className="h-4 w-32 rounded bg-navy-100" />
            </div>

            <div className="h-4 w-28 rounded bg-amber-100" />

            {/* Specifications list skeleton */}
            <div className="space-y-2.5 border-t border-navy-100 pt-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-2/3 rounded bg-navy-100/70" />
              ))}
            </div>

            {/* Price Box Skeleton */}
            <div className="flex items-center gap-4 border-y border-navy-100 py-4">
              <div className="h-9 w-40 rounded-lg bg-navy-200" />
              <div className="h-5 w-24 rounded bg-navy-100/60" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-4">
              <div className="h-12 flex-1 rounded-xl bg-navy-200" />
              <div className="h-12 w-12 rounded-xl bg-navy-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
