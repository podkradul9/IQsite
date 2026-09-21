import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getCurrentUser, getSubscriptionStatus } from "../lib/supabaseClient";
import Spinner from "../components/Spinner";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState(null);
  const [history, setHistory] = useState([]);
  const [canceling, setCanceling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const u = await getCurrentUser();
      if (!u) return navigate("/login");
      setUser(u);
      setSub(await getSubscriptionStatus(u.id));
      const { data } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });
      setHistory(data || []);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- намеренно запускаем один раз при монтировании
  }, []);

  async function cancelSubscription() {
    if (!confirm("Отменить подписку? Доступ сохранится до конца оплаченного периода.")) return;
    setCanceling(true);
    await supabase.functions.invoke("cancel-subscription", { body: { userId: user.id } });
    setSub((s) => ({ ...s, status: "canceled" }));
    setCanceling(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  if (!user) return <Spinner />;

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-2xl font-bold text-ink">Личный кабинет</h1>
          <button onClick={logout} className="text-ink-soft hover:text-ink-soft text-sm rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-marker">
            Выйти
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-ink mb-3">Подписка</h2>
          {sub ? (
            <>
              <p className="text-ink-soft text-sm mb-1">
                Статус: <span className="text-ink font-medium">{sub.status}</span>
              </p>
              {sub.current_period_end && (
                <p className="text-ink-soft text-sm mb-4">
                  Действует до: {new Date(sub.current_period_end).toLocaleDateString("ru-RU")}
                </p>
              )}
              {sub.status !== "canceled" && (
                <button
                  onClick={cancelSubscription}
                  disabled={canceling}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  {canceling ? "Отменяем..." : "Отменить подписку"}
                </button>
              )}
              {sub.unsubscribe_token && (
                <p className="text-ink-soft text-xs mt-4">
                  Ссылка для отмены без входа (пойдёт в письмо после настройки email-рассылки):
                  <br />
                  <code className="text-ink-soft break-all">
                    {window.location.origin}/unsubscribe?token={sub.unsubscribe_token}
                  </code>
                </p>
              )}
            </>
          ) : (
            <p className="text-ink-soft text-sm">Подписка не оформлена</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-ink mb-3">История тестов</h2>
          {history.length === 0 ? (
            <p className="text-ink-soft text-sm">Пока ничего не пройдено</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="text-sm text-ink-soft flex justify-between">
                  <span>{h.test_slug} — {h.result_title}</span>
                  <span className="text-ink-soft">
                    {new Date(h.created_at).toLocaleDateString("ru-RU")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
