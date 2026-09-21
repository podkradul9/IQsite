// Supabase Edge Function (Deno). URL этой функции нужно указать в кабинете ЮKassa
// как webhook-адрес для событий payment.succeeded / payment.canceled.
// Деплой: supabase functions deploy yookassa-webhook --no-verify-jwt
// (--no-verify-jwt — потому что запрос шлёт ЮKassa, а не залогиненный пользователь)

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const event = await req.json();
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const payment = event.object;
  const userId = payment?.metadata?.userId;
  if (!userId) return new Response("no userId in metadata", { status: 200 });

  await supabase.from("payment_events").update({
    status: payment.status,
    raw: payment,
  }).eq("yookassa_payment_id", payment.id);

  // ВАЖНО: ЮKassa шлёт этот вебхук на КАЖДЫЙ успешный платёж в магазине — включая
  // плановые рекуррентные списания, которые создаёт charge-recurring. Тот раньше
  // не различал типы платежей и после любого payment.succeeded ставил статус
  // 'trial' с периодом в 3 дня — из-за этого уже активная 30-дневная подписка
  // откатывалась на 3 дня при каждом продлении. Различаем по payment.metadata.kind:
  // 'trial' обрабатываем здесь, 'recurring' уже обработан внутри charge-recurring
  // (там же обновляется current_period_end на +30 дней), повторно трогать не нужно.
  if (event.event === "payment.succeeded" && payment.metadata?.kind !== "recurring") {
    const trialDays = 3;
    const periodEnd = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    // Email нужен, чтобы показать его на странице /unsubscribe (без логина)
    // и чтобы вставить ссылку отписки в письмо с подтверждением оплаты.
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const email = userData?.user?.email ?? null;

    // .select().single() — чтобы сразу получить unsubscribe_token строки:
    // при первой вставке он генерируется базой (gen_random_uuid()), заранее
    // мы его не знаем, а он нужен для ссылки отмены в письме ниже.
    const { data: sub } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        user_email: email,
        status: "trial",
        payment_method_id: payment.payment_method?.saved ? payment.payment_method.id : null,
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Письмо — не критичный путь: если оно не уйдёт (Resend не настроен, домен не
    // подтверждён и т.п.), подписка всё равно активна. Поэтому не даём этой части
    // уронить обработку вебхука — ЮKassa должна получить свои 200 OK в любом случае.
    if (email && sub?.unsubscribe_token) {
      try {
        await supabase.functions.invoke("send-confirmation-email", {
          body: { email, unsubscribeToken: sub.unsubscribe_token },
        });
      } catch (e) {
        console.error("send-confirmation-email call failed:", e);
      }
    }
  }

  if (event.event === "payment.canceled") {
    // Пробный или очередной платёж не прошёл — не активируем/не продлеваем подписку
  }

  // ЮKassa ожидает 200 OK в любом случае успешной обработки
  return new Response("ok", { status: 200 });
});
