import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-5xl font-bold text-ink/15 mb-3">404</p>
      <h1 className="font-display text-xl font-bold text-ink mb-2">Страница не найдена</h1>
      <p className="text-ink-soft text-sm mb-6">Такой страницы нет — возможно, ссылка устарела.</p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-marker hover:bg-marker-dark text-white font-semibold text-sm transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-marker focus-visible:ring-offset-2"
      >
        На главную
      </Link>
    </div>
  );
}
