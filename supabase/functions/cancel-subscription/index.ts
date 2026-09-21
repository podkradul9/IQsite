// Деплой: supabase functions deploy cancel-subscription

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const { userId } = await req.json();
  if (!userId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400 });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Важно: доступ НЕ обрывается сразу — сохраняется до конца оплаченного периода
  // (current_period_end), просто больше не будет автосписаний. Это должно быть
  // прописано в вашей оферте — см. пример в предыдущем разборе iqmo.ru.
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
