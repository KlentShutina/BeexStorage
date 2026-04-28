import { useEffect, useState } from "react";
import logo from "./assets/logo.png";

export default function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf;
    let v = 0;
    const step = () => {
      v += 3;
      if (v >= 100) {
        setPct(100);
        setTimeout(() => onDone && onDone(), 250);
        return;
      }
      setPct(v);
      raf = setTimeout(step, 30);
    };
    step();
    return () => raf && clearTimeout(raf);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero">
      <div className="animate-float mb-6">
        <img
          src={logo}
          alt="BeexStorage"
          className="h-32 w-32 rounded-3xl shadow-2xl ring-4 ring-white/40"
        />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-beex-ink">
        BeexStorage
      </h1>
      <p className="mt-1 text-sm font-medium text-beex-ink/70">
        Smart inventory management
      </p>
      <div className="mt-8 h-2 w-64 overflow-hidden rounded-full bg-white/40">
        <div
          className="h-full bg-beex-ink transition-all duration-100 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs font-semibold tabular-nums text-beex-ink/70">
        {pct}%
      </p>
    </div>
  );
}
