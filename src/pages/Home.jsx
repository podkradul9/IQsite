import { Link } from "react-router-dom";
import { tests, reactionTest } from "../data/tests";

const categoryDot = {
  indigo: "#3346FF",
  rose: "#EC4899",
  violet: "#8B5CF6",
  amber: "#F5A623",
};

const featured = tests.find((t) => t.slug === "iq-full");
const secondaryTests = [...tests.filter((t) => t.slug !== "iq-full"), reactionTest];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-ink">TestLab</span>
        <Link
          to="/login"
          className="px-4 py-2 rounded-xl text-ink-soft hover:text-ink transition text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-marker"
        >
          Войти
        </Link>
      </header>

      {/* Хиро: тёмная панель с точечной сеткой (бланк ответов) и макетом карточки вопроса —
          единственное по-настоящему смелое место на странице. */}
      <section className="relative overflow-hidden rounded-[32px] mx-4 sm:mx-6 bg-ink">
        <div className="absolute inset-0 bg-dot-grid opacity-30" aria-hidden="true" />
        <div className="relative grid md:grid-cols-2 gap-10 items-center px-6 sm:px-10 py-14 md:py-20 max-w-6xl mx-auto">
          <div>
            <h1 className="font-display text-white text-4xl sm:text-5xl font-bold leading-[1.08] mb-5">
              Узнайте себя за пять минут
            </h1>
            <p className="text-white/65 text-lg mb-8 max-w-md">
              Тесты на логику, реакцию, отношения и характер — с честным разбором результата,
              а не общими фразами на все случаи жизни.
            </p>
            <a
              href="#tests"
              className="inline-flex items-center gap-2 bg-marker hover:bg-marker-dark text-white font-semibold px-7 py-3.5 rounded-2xl transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Пройти тест
            </a>
          </div>

          <div className="relative hidden md:block h-64" aria-hidden="true">
            <div className="absolute right-2 top-10 w-56 h-52 rounded-2xl bg-white/10 rotate-6" />
            <div className="absolute right-10 top-0 w-64 bg-white rounded-2xl p-5 shadow-xl -rotate-3">
              <div className="text-ink/35 text-xs mb-3 font-medium">Вопрос 4 из 12</div>
              <div className="h-3 w-full bg-ink/10 rounded mb-4" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border-2 border-ink/15 shrink-0" />
                  <span className="h-2.5 flex-1 bg-ink/10 rounded" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-marker shrink-0" />
                  <span className="h-2.5 flex-1 bg-ink/20 rounded" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border-2 border-ink/15 shrink-0" />
                  <span className="h-2.5 flex-1 bg-ink/10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tests" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-xl font-bold text-ink mb-6">Тесты</h2>

        <Link
          to={`/test/${featured.slug}`}
          className="group block rounded-3xl bg-ink text-white p-8 mb-4 transition hover:bg-[#1c1e40] focus:outline-none focus-visible:ring-2 focus-visible:ring-marker"
        >
          <span className="text-xs font-semibold text-white/50 mb-3 block">Флагманский тест</span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2">{featured.title}</h3>
          <p className="text-white/60 max-w-md">{featured.description}</p>
        </Link>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {secondaryTests.map((t) => (
            <Link
              key={t.slug}
              to={`/test/${t.slug}`}
              className="p-5 rounded-2xl bg-white hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-marker"
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mb-3"
                style={{ background: categoryDot[t.accent] }}
                aria-hidden="true"
              />
              <p className="text-xs font-medium mb-1" style={{ color: categoryDot[t.accent] }}>
                {t.category}
              </p>
              <h3 className="font-semibold text-ink mb-1">{t.title}</h3>
              <p className="text-ink-soft text-sm">{t.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-ink-soft text-sm border-t border-ink/10 mt-6">
        <div className="flex flex-wrap gap-4">
          <Link to="/docs/oferta" className="hover:text-ink rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">Публичная оферта</Link>
          <Link to="/docs/privacy" className="hover:text-ink rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">Политика конфиденциальности</Link>
          <Link to="/docs/agreement" className="hover:text-ink rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">Пользовательское соглашение</Link>
          <Link to="/docs/tariffs" className="hover:text-ink rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">Тарифы</Link>
          <Link to="/docs/consent" className="hover:text-ink rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">Согласие на обработку данных</Link>
          <Link to="/unsubscribe" className="hover:text-ink rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">Отменить подписку</Link>
        </div>
      </footer>
    </div>
  );
}
