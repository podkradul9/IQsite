import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { reactionTest, getReactionResult, getReactionPercent } from "../data/tests";
import { getCurrentUser, getSubscriptionStatus, saveTestResult } from "../lib/supabaseClient";
import PaywallModal from "../components/PaywallModal";
import Spinner from "../components/Spinner";
import ScoreGauge from "../components/ScoreGauge";

export default function ReactionResult() {
  const location = useLocation();
  const avgMs = location.state?.avgMs;
  const times = location.state?.times || [];
  const result = avgMs != null ? getReactionResult(avgMs) : null;

  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function check() {
      const user = await getCurrentUser();
      if (user) {
        const sub = await getSubscriptionStatus(user.id);
        const active = sub && ["trial", "active"].includes(sub.status);
        setHasAccess(active);
        if (active && avgMs != null) {
          await saveTestResult(user.id, reactionTest.slug, avgMs, result?.title ?? "");
        }
      }
      setLoading(false);
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- намеренно запускаем один раз при монтировании
  }, []);

  if (!avgMs || !result) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-ink-soft mb-4">Сначала нужно пройти тест.</p>
          <Link to={`/test/${reactionTest.slug}`} className="text-marker underline">
            Пройти тест на реакцию
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg w-full">
        <p className="text-ink-soft mb-6">{reactionTest.title}</p>

        <div className="flex justify-center mb-2">
          <ScoreGauge percent={getReactionPercent(avgMs)} label={`${avgMs}мс`} color="#F5A623" />
        </div>
        <p className="text-ink-soft text-sm mb-6">среднее за {times.length} раундов</p>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-6">{result.title}</h1>

        {hasAccess ? (
          <p className="text-ink-soft leading-relaxed">{result.text}</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-ink-soft mb-4 text-sm">
              Подробный разбор результата и сравнение с другими открывается по подписке.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 rounded-xl bg-marker hover:bg-marker-dark text-white font-semibold transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-marker focus-visible:ring-offset-2"
            >
              Получить результат
            </button>
          </div>
        )}

        <Link to="/" className="block mt-8 text-ink-soft hover:text-ink text-sm rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">
          ← Ко всем тестам
        </Link>
      </div>

      {showModal && <PaywallModal testSlug={reactionTest.slug} onClose={() => setShowModal(false)} />}
    </div>
  );
}
