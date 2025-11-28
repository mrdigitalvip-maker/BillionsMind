import { createClient } from "@supabase/supabase-js";

// 🔥 Troque pela sua ANON KEY
const supabase = createClient(
  "https://vrhmadjnjcakvzwse.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eHZyaG1hZGpuamNha3Z6d3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDgxNDYsImV4cCI6MjA3OTQyNDE0Nn0.7TDKS3a7hLf10iao5Y-Dv8Q7YML2IIRzF8--KeRfb-0" 
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

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

  // Criar o registro do usuário na tabela 'usuarios'
  const { error: insertError } = await supabase.from("usuarios").insert({
    id_autenticacao: userId,
    email: email,
    nome: "",
    plano: "visionário",
    criado_em: new Date(),
  });

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(200).json({
    message: "Usuário criado com sucesso!",
    user_id: userId,
  });
}
