import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | register | magic
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "magic") {
      setSending(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      setSending(false);
      if (error) {
        setError(error.message);
        return;
      }
      setMagicSent(true);
      return;
    }

    const action =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;
    if (error) {
      setError(error.message);
      return;
    }
    navigate(params.get("next") || "/dashboard");
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-7">
        <h1 className="font-display text-xl font-bold text-ink mb-1">
          {mode === "magic" ? "Вход по ссылке" : mode === "login" ? "Вход" : "Регистрация"}
        </h1>
        {mode === "magic" && !magicSent && (
          <p className="text-xs text-ink-soft mb-5">
            Подходит, если вы оформляли подписку через оплату результата — пароль для такого
            аккаунта не задавался.
          </p>
        )}
        {mode !== "magic" && <div className="mb-5" />}

        {magicSent ? (
          <p className="text-sm text-ink-soft bg-paper rounded-xl p-4">
            Отправили ссылку на <b>{email}</b>. Откройте её с этого же устройства, чтобы войти.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 px-4 py-3 rounded-xl bg-paper border-2 border-transparent focus:border-marker outline-none text-ink"
              required
            />
            {mode !== "magic" && (
              <input
                type="password"
                placeholder="Пароль"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-3 rounded-xl bg-paper border-2 border-transparent focus:border-marker outline-none text-ink"
                required
                minLength={6}
              />
            )}

            {error && <p className="text-rose-600 text-sm mb-4">{error}</p>}

            <button
              disabled={sending}
              className="w-full py-3 rounded-xl bg-marker hover:bg-marker-dark disabled:opacity-50 text-white font-bold transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-marker focus-visible:ring-offset-2"
            >
              {sending ? "Отправляем..." : mode === "magic" ? "Прислать ссылку для входа" : mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </>
        )}

        <div className="flex flex-col gap-1 mt-4 text-center">
          {mode !== "magic" && (
            <button
              type="button"
              onClick={() => { setMode("magic"); setError(""); setMagicSent(false); }}
              className="text-sm text-marker hover:text-marker-dark rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker"
            >
              Оформляли подписку через оплату? Войти по ссылке на email
            </button>
          )}
          {mode === "magic" ? (
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setMagicSent(false); }}
              className="text-sm text-ink-soft hover:text-ink-soft rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker"
            >
              ← Войти по паролю вместо этого
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-sm text-ink-soft hover:text-ink-soft rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker"
            >
              {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
            </button>
          )}
        </div>

        <Link to="/" className="block mt-4 text-center text-xs text-ink-soft hover:text-ink-soft rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">
          ← На главную
        </Link>
      </form>
    </div>
  );
}
