import { Star } from "lucide-react";

export function RatingStars({
  rating,
  reviews,
  size = 14,
}: {
  rating: number;
  reviews?: number | null;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-gold-500 text-gold-500" : "fill-navy-100 text-navy-100"}
            />
          );
        })}
      </div>
      <span className="text-[10px] sm:text-xs text-navy-900/70 truncate ml-1">
        {rating.toFixed(1)}
        {typeof reviews === "number" ? <span className="hidden sm:inline"> ({reviews} sharh)</span> : ""}
        {typeof reviews === "number" ? <span className="sm:hidden"> ({reviews})</span> : ""}
      </span>
    </div>
  );
}
