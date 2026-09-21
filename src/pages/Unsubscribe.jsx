import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState(token ? "loading" : "notfound");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!token) return;
    supabase.functions
      .invoke("unsubscribe", { body: { token, action: "info" } })
      .then(({ data, error }) => {
        if (error || !data || data.error) {
          setStatus("notfound");
        } else {
          setInfo(data);
          setStatus("found");
        }
      });
  }, [token]);

  async function confirmCancel() {
    setStatus("canceling");
    const { data, error } = await supabase.functions.invoke("unsubscribe", {
      body: { token, action: "cancel" },
    });
    if (error) {
      setStatus("error");
      return;
    }
    setInfo((prev) => ({ ...prev, status: "canceled", current_period_end: data.current_period_end }));
    setStatus("done");
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-7 text-center">
        <h1 className="font-display text-xl font-bold text-ink mb-4">Отмена подписки</h1>

        {status === "loading" && <p className="text-ink-soft">Проверяем ссылку...</p>}

        {status === "notfound" && (
          <p className="text-ink-soft text-sm">
            Ссылка недействительна или устарела. Если у вас есть аккаунт, отменить подписку
            также можно в{" "}
            <Link to="/login" className="text-marker underline">
              личном кабинете
            </Link>
            .
          </p>
        )}

        {(status === "found" || status === "canceling") && info && (
          <>
            <p className="text-ink-soft mb-1 text-sm">Аккаунт: {info.email}</p>
            <p className="text-ink-soft mb-6 text-sm">
              Текущий статус подписки: <span className="text-ink font-medium">{info.status}</span>
            </p>
            {info.status === "canceled" ? (
              <p className="text-ink-soft">Подписка уже отменена.</p>
            ) : (
              <>
                <p className="text-ink-soft text-sm mb-5">
                  Доступ сохранится до конца уже оплаченного периода. Новых списаний не будет.
                </p>
                <button
                  onClick={confirmCancel}
                  disabled={status === "canceling"}
                  className="w-full py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-[0.98] disabled:opacity-50 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  {status === "canceling" ? "Отменяем..." : "Подтвердить отмену подписки"}
                </button>
              </>
            )}
          </>
        )}

        {status === "done" && (
          <p className="text-ink-soft">
            Подписка отменена. Доступ сохранится до{" "}
            {info?.current_period_end
              ? new Date(info.current_period_end).toLocaleDateString("ru-RU")
              : "конца оплаченного периода"}
            .
          </p>
        )}

        {status === "error" && (
          <p className="text-rose-600 text-sm">Не получилось отменить подписку. Напишите нам на support@ваш-домен.ru</p>
        )}

        <Link to="/" className="block mt-6 text-ink-soft hover:text-ink-soft text-sm">
          ← На главную
        </Link>
      </div>
    </div>
  );
}
