// Деплой: supabase functions deploy unsubscribe --no-verify-jwt
// --no-verify-jwt — потому что этот endpoint должен работать БЕЗ авторизации,
// человек попадает сюда просто по ссылке из письма: /unsubscribe?token=xxx
//
// Принимает POST { token, action: "info" | "cancel" }
//  - "info"   -> возвращает статус подписки и частично скрытый email, без чувствительных данных
//  - "cancel" -> помечает подписку как canceled (доступ сохраняется до конца периода)

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function maskEmail(email: string | null) {
  if (!email) return null;
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

Deno.serve(async (req) => {
  const { token, action } = await req.json();
  if (!token) {
    return new Response(JSON.stringify({ error: "token required" }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: sub, error } = await supabase
    .from("subscriptions")
    .select("user_email, status, current_period_end")
    .eq("unsubscribe_token", token)
    .single();

  if (error || !sub) {
    return new Response(JSON.stringify({ error: "Подписка не найдена" }), { status: 404 });
  }

  if (action === "cancel") {
    await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("unsubscribe_token", token);

    return new Response(
      JSON.stringify({ ok: true, current_period_end: sub.current_period_end }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // action === "info" (по умолчанию)
  return new Response(
    JSON.stringify({
      email: maskEmail(sub.user_email),
      status: sub.status,
      current_period_end: sub.current_period_end,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
