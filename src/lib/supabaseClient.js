import { createClient } from "@supabase/supabase-js";

// Эти значения берутся из .env файла (см. .env.example)
// Получить их: Supabase Dashboard -> Project Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase не настроен (.env пуст) — сайт откроется и будет выглядеть как обычно, " +
    "но вход, оплата и сохранение результатов работать не будут, пока не заполните .env."
  );
}

// Заглушка вместо реального проекта, чтобы createClient не падал с ошибкой
// и можно было просто посмотреть дизайн без настройки Supabase.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

// --- Вспомогательные функции для работы с подпиской пользователя ---

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null; // Supabase не настроен — считаем, что пользователь не залогинен
  }
}

export async function getSubscriptionStatus(userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data; // { status: 'active' | 'trial' | 'canceled' | 'expired', current_period_end, ... }
}

export async function saveTestResult(userId, testSlug, score, resultTitle) {
  return supabase.from("test_results").insert({
    user_id: userId,
    test_slug: testSlug,
    score,
    result_title: resultTitle,
  });
}
