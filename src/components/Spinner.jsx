export default function Spinner({ label = "Загрузка..." }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <div className="w-8 h-8 border-2 border-marker/25 border-t-marker rounded-full animate-spin" aria-hidden="true" />
      <span className="text-ink-soft text-sm">{label}</span>
    </div>
  );
}
