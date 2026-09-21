import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, getCurrentUser } from "../lib/supabaseClient";

// Таймер — мягкий визуальный акцент (создаёт ощущение темпа), а НЕ ложное обещание
// "цена вырастет после" — когда он доходит до нуля, просто останавливается на 00:00:00,
// без циклического сброса. Так интерфейс не врёт пользователю о реальном дедлайне.
const COUNTDOWN_START = 5 * 60; // 5 минут в секундах

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0"));
}

export default function PaywallModal({ testSlug, onClose }) {
  const [email, setEmail] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeSub, setAgreeSub] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START);

  const firstFieldRef = useRef(null);

  useEffect(() => {
    getCurrentUser().then((u) => setLoggedInEmail(u?.email ?? null));
  }, []);

  // Клавиша Escape закрывает модалку, скролл фоновой страницы блокируется, пока она открыта —
  // без этого пользователь мог прокручивать содержимое под модалкой, что сбивает с толку.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const [hh, mm, ss] = formatTime(secondsLeft);
  const emailValid = loggedInEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailValid && agreeTerms && agreeSub && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      let userId;
      if (loggedInEmail) {
        const user = await getCurrentUser();
        userId = user.id;
      } else {
        // Невидимая для пользователя регистрация: пароль генерируется случайно,
        // человек нигде его не вводит — вернуться в личный кабинет позже можно по
        // этому же email через "Войти по ссылке" на странице входа (magic link).
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password: crypto.randomUUID(),
        });
        if (signUpError) {
          if (signUpError.message?.toLowerCase().includes("already registered")) {
            setError("Этот email уже зарегистрирован. Войдите в личный кабинет, чтобы продолжить.");
          } else {
            setError(signUpError.message);
          }
          setLoading(false);
          return;
        }
        if (!data.session) {
          setError("Подтверждение email включено в настройках Supabase — отключите его для мгновенной оплаты (см. README).");
          setLoading(false);
          return;
        }
        userId = data.user.id;
      }

      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: { userId, testSlug },
      });
      if (fnError || !data?.confirmationUrl) {
        setError("Не удалось создать платёж. Попробуйте позже.");
        setLoading(false);
        return;
      }
      window.location.href = data.confirmationUrl;
    } catch (err) {
      console.error("Payment flow failed:", err);
      setError("Что-то пошло не так. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl p-7 animate-modal-pop"
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-5 right-5 text-ink-soft hover:text-ink text-xl leading-none rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-marker"
        >
          ×
        </button>

        <h2 id="paywall-title" className="font-display text-2xl font-bold text-ink text-center mb-3 leading-tight">
          Результаты теста готовы!
        </h2>
        <p className="text-center text-marker font-bold text-lg mb-5">Цена всего за 10 ₽*</p>

        <div className="flex justify-center gap-3 mb-4" aria-hidden="true">
          {[
            [hh, "часы"],
            [mm, "мин"],
            [ss, "сек"],
          ].map(([val, label], i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold tabular-nums ${
                  i === 0 ? "bg-ink text-white" : "border-2 border-marker/50 text-ink"
                }`}
              >
                {val}
              </div>
              <span className="text-[11px] text-ink-soft mt-1">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-ink-soft mb-5">
          *Первые 3 дня, далее списание 100 ₽ каждые 30 дней. Отмена в любой момент.
        </p>

        <form onSubmit={handleSubmit}>
          {!loggedInEmail && (
            <input
              ref={firstFieldRef}
              type="email"
              autoComplete="email"
              placeholder="Введите ваш email адрес"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-xl border-2 border-ink/10 focus:border-marker outline-none text-ink"
            />
          )}
          {loggedInEmail && (
            <p className="w-full mb-4 px-4 py-3 rounded-xl bg-paper text-ink-soft text-sm">{loggedInEmail}</p>
          )}

          <label className="flex items-start gap-2 mb-3 text-xs text-ink-soft leading-relaxed">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 accent-marker"
            />
            <span>
              Я согласен(а) с{" "}
              <Link to="/docs/oferta" target="_blank" className="underline hover:text-ink">договором публичной оферты</Link>,{" "}
              <Link to="/docs/privacy" target="_blank" className="underline hover:text-ink">политикой обработки персональных данных</Link>,{" "}
              <Link to="/docs/tariffs" target="_blank" className="underline hover:text-ink">тарифами</Link>.
            </span>
          </label>

          <label className="flex items-start gap-2 mb-5 text-xs text-ink-soft leading-relaxed">
            <input
              type="checkbox"
              checked={agreeSub}
              onChange={(e) => setAgreeSub(e.target.checked)}
              className="mt-0.5 accent-marker"
            />
            <span>
              Согласен(а) на автоматическую подписку: 10 ₽ за 3 дня пробного периода, далее 100 ₽
              каждые 30 дней. Отмена в любой момент на странице{" "}
              <Link to="/unsubscribe" target="_blank" className="underline hover:text-ink">отмены подписки</Link>.
            </span>
          </label>

          {error && (
            <p className="text-red-500 text-xs mb-3" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3.5 rounded-xl bg-marker hover:bg-marker-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-marker focus-visible:ring-offset-2"
          >
            {loading ? "Секунду..." : "Получить результат"}
          </button>
        </form>
      </div>
    </div>
  );
}
