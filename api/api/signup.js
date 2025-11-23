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

  // Criar conta no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const userId = authData.user.id;

  // Criar plano inicial FREE
  await supabase.from("usa_planos").insert([
    {
      id: userId,
      email,
      plano: "free",
      renovacao: null,
    },
  ]);

  return res.status(200).json({ message: "Conta criada com sucesso!", user: authData.user });
}
