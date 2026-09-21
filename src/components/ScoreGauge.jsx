import { useEffect, useState } from "react";

// Круговая шкала как на экзаменационном бланке. percent: 0–100.
// Анимированное заполнение при появлении — единственный "поставленный" момент
// движения на сайте, специально приберегли эффект для главной кульминации.
export default function ScoreGauge({ percent, label, color = "var(--color-marker)" }) {
  const [filled, setFilled] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setFilled(percent), 150);
    return () => clearTimeout(t);
  }, [percent]);

  const offset = circumference - (filled / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" role="img" aria-label={`Результат: ${label}`}>
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#E7E7F2" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-bold text-ink tabular-nums">{label}</span>
      </div>
    </div>
  );
}
