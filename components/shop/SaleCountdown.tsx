"use client";

import { useEffect, useState } from "react";

function two(n: number) {
  return n.toString().padStart(2, "0");
}

export function SaleCountdown() {
  const [target] = useState(() => Date.now() + 1000 * 60 * 60 * 26); // demo: ~26h out
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    setRemaining(Math.max(0, target - Date.now()));
    return () => clearInterval(t);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex items-center gap-1 text-xs font-semibold text-navy-900">
      {[hours, minutes, seconds].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="rounded bg-[#5E3023] px-1.5 py-1 text-white font-bold shadow-2xs border border-[#C5A059]/30">{two(v)}</span>
          {i < 2 && <span className="font-bold text-navy-900">:</span>}
        </span>
      ))}
    </div>
  );
}
