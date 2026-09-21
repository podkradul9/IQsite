// Supabase Edge Function (Deno). Деплой: supabase functions deploy create-payment
// Требует секреты (supabase secrets set):
//   YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, SITE_URL

import { createClient } from "npm:@supabase/supabase-js@2";

const YOOKASSA_SHOP_ID = Deno.env.get("YOOKASSA_SHOP_ID")!;
const YOOKASSA_SECRET_KEY = Deno.env.get("YOOKASSA_SECRET_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TRIAL_PRICE_RUB = 10; // цена пробного периода (3 дня); далее 100 ₽ / 30 дней — см. схему БД

Deno.serve(async (req) => {
  try {
    const { userId, testSlug } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), { status: 400 });
    }

    const idempotenceKey = crypto.randomUUID();
    const basicAuth = btoa(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`);

    // Создаём платёж в ЮKassa: сумма пробного периода + флаг save_payment_method,
    // чтобы потом списывать 100 ₽/30 дней без повторного участия пользователя.
    const ykResponse = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        "Authorization": `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: { value: TRIAL_PRICE_RUB.toFixed(2), currency: "RUB" },
        capture: true,
        save_payment_method: true,
        confirmation: {
          type: "redirect",
          return_url: `${SITE_URL}/test/${testSlug}/result`,
        },
        description: `Пробный период подписки — ${testSlug}`,
        metadata: { userId, testSlug, kind: "trial" },
      }),
    });

    const payment = await ykResponse.json();
    if (!ykResponse.ok) {
      return new Response(JSON.stringify({ error: payment }), { status: 502 });
    }

    // Записываем "pending" — статус обновится вебхуком после подтверждения оплаты
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    await supabase.from("payment_events").insert({
      user_id: userId,
      yookassa_payment_id: payment.id,
      amount_kopeks: Math.round(TRIAL_PRICE_RUB * 100),
      status: payment.status,
      raw: payment,
    });

    return new Response(
      JSON.stringify({ confirmationUrl: payment.confirmation.confirmation_url }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
