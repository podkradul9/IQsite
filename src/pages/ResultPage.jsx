import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getTestBySlug, calculateResult, getMaxScore } from "../data/tests";
import { getCurrentUser, getSubscriptionStatus, saveTestResult } from "../lib/supabaseClient";
import PaywallModal from "../components/PaywallModal";
import Spinner from "../components/Spinner";
import ScoreGauge from "../components/ScoreGauge";

export default function ResultPage() {
  const { slug } = useParams();
  const location = useLocation();
  const test = getTestBySlug(slug);
  const answers = location.state?.answers || {};
  const { total, result } = test ? calculateResult(test, answers) : {};
  const maxScore = test ? getMaxScore(test) : 0;

  const [hasAccess, setHasAccess] = useState(test?.freePreview ?? false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function check() {
      const user = await getCurrentUser();
      if (user) {
        const sub = await getSubscriptionStatus(user.id);
        const active = sub && ["trial", "active"].includes(sub.status);
        setHasAccess(test.freePreview || active);
        if (active || test.freePreview) {
          await saveTestResult(user.id, slug, total, result.title);
        }
      } else {
        setHasAccess(test.freePreview);
      }
      setLoading(false);
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- намеренно запускаем один раз при монтировании
  }, []);

  if (!test) return <div className="min-h-screen bg-paper flex items-center justify-center text-ink-soft">Тест не найден</div>;
  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg w-full">
        <p className="text-ink-soft mb-6">{test.title}</p>

        <div className="flex justify-center mb-6">
          <ScoreGauge percent={(total / maxScore) * 100} label={`${total}/${maxScore}`} />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-6">{result.title}</h1>

        {hasAccess ? (
          <p className="text-ink-soft leading-relaxed">{result.text}</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-ink-soft mb-4 text-sm">
              Полный отчёт с рекомендациями доступен по подписке.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 rounded-xl bg-marker hover:bg-marker-dark text-white font-semibold transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-marker focus-visible:ring-offset-2"
            >
              Получить результат
            </button>
          </div>
        )}

        {test.note && (
          <p className="text-xs text-ink-soft/70 mt-4 italic">{test.note}</p>
        )}

        <Link to="/" className="block mt-8 text-ink-soft hover:text-ink text-sm rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">
          ← Ко всем тестам
        </Link>
      </div>

      {showModal && <PaywallModal testSlug={slug} onClose={() => setShowModal(false)} />}
    </div>
  );
}
