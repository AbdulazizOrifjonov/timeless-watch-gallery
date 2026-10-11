import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  dark = false,
  hideTextOnMobile = false,
  className,
}: {
  dark?: boolean;
  hideTextOnMobile?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex items-center shrink-0 group", className)}>
      <div className="inline-flex h-11 items-center justify-center overflow-hidden rounded-lg bg-[#5E3023] px-3 shadow-md transition-transform duration-300 group-hover:scale-[1.02]">
        <img
          src="/logo.png"
          alt="Timeless — The Watch Gallery"
          className={cn(
            "h-[26px] sm:h-[34px] w-auto object-contain transition-all",
            hideTextOnMobile ? "max-w-[160px] md:max-w-none" : ""
          )}
        />
      </div>
    </Link>
  );
}
