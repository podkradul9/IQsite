// Отправляет письмо о старте пробного периода со ссылкой на /unsubscribe.
// Деплой: supabase functions deploy send-confirmation-email --no-verify-jwt
// (вызывается из yookassa-webhook по service role, не с фронтенда — но флаг
// нужен, так как это server-to-server вызов без пользовательского JWT)
//
// Секреты (supabase secrets set):
//   RESEND_API_KEY  — ключ из resend.com
//   FROM_EMAIL      — например "TestLab <noreply@ваш-домен.ru>". Домен должен
//                     быть подтверждён в Resend, иначе письма будут уходить
//                     только на ваш собственный email из тестового домена resend.dev
//   SITE_URL        — тот же, что и в остальных функциях

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!;
const SITE_URL = Deno.env.get("SITE_URL")!;

Deno.serve(async (req) => {
  try {
    const { email, unsubscribeToken } = await req.json();
    if (!email || !unsubscribeToken) {
      return new Response(JSON.stringify({ error: "email и unsubscribeToken обязательны" }), { status: 400 });
    }

    const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${unsubscribeToken}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
        <h2 style="color:#0f172a;">Пробный период активирован</h2>
        <p>Вы получили доступ к результатам теста на TestLab на 3 дня.</p>
        <p>Далее подписка продлевается автоматически — 100 ₽ каждые 30 дней, до отмены.</p>
        <p>
          <a href="${unsubscribeUrl}" style="color:#3b82f6;">Отменить подписку</a>
          можно в любой момент по этой ссылке, без входа в аккаунт.
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "TestLab — пробный период активирован",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      // Письмо — не критичный путь: если Resend недоступен или домен не подтверждён,
      // подписка уже активна независимо от письма. Логируем и возвращаем 200,
      // чтобы вызывающий вебхук не считал это провалом всей активации.
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ sent: false, error: err }), { status: 200 });
    }

    return new Response(JSON.stringify({ sent: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-confirmation-email failed:", e);
    return new Response(JSON.stringify({ sent: false, error: String(e) }), { status: 200 });
  }
});
