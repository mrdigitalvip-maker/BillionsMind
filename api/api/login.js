import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { email, password } = req.body;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // Buscar plano do usuário
  const { data: planoData, error: planoError } = await supabase
    .from("usa_planos")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  return res.status(200).json({
    message: "Login bem-sucedido!",
    user: authData.user,
    plano: planoData,
  });
}
