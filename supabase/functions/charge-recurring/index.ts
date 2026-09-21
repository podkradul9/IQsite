// Эта функция НЕ вызывается фронтендом — её запускает Supabase Cron (pg_cron)
// раз в день по расписанию. Она находит подписки, у которых закончился
// оплаченный период и статус не 'canceled', и списывает деньги сохранённым
// payment_method_id через ЮKassa.
//
// Настройка cron (в SQL Editor Supabase):
//   select cron.schedule('charge-recurring-daily', '0 3 * * *',
//     $$ select net.http_post(url:='https://<project>.functions.supabase.co/charge-recurring',
//        headers:='{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb) $$);
//
// Деплой: supabase functions deploy charge-recurring --no-verify-jwt

import { createClient } from "npm:@supabase/supabase-js@2";

const YOOKASSA_SHOP_ID = Deno.env.get("YOOKASSA_SHOP_ID")!;
const YOOKASSA_SECRET_KEY = Deno.env.get("YOOKASSA_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const basicAuth = btoa(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`);

  const { data: due, error } = await supabase
    .from("subscriptions")
    .select("*")
    .in("status", ["trial", "active"])
    .lte("current_period_end", new Date().toISOString())
    .not("payment_method_id", "is", null);

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  const results = [];
  for (const sub of due ?? []) {
    const idempotenceKey = crypto.randomUUID();
    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        "Authorization": `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: { value: (sub.price_kopeks / 100).toFixed(2), currency: "RUB" },
        capture: true,
        payment_method_id: sub.payment_method_id,
        description: "Продление подписки",
        metadata: { userId: sub.user_id, kind: "recurring" },
      }),
    });
    const payment = await res.json();

    if (res.ok && payment.status === "succeeded") {
      const nextEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-дневный цикл, 100 ₽
      await supabase.from("subscriptions").update({
        status: "active",
        current_period_end: nextEnd.toISOString(),
      }).eq("user_id", sub.user_id);
    } else {
      // Платёж не прошёл (карта заблокирована, недостаточно средств и т.п.)
      await supabase.from("subscriptions").update({ status: "expired" }).eq("user_id", sub.user_id);
    }
    results.push({ userId: sub.user_id, status: payment.status ?? "error" });
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
