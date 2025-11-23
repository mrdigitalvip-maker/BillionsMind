import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { user_id, meta_diaria, modo_dark, notificacoes } = req.body;

  const { data, error } = await supabase
    .from("config_usuario")
    .upsert([
      {
        user_id,
        meta_diaria,
        modo_dark,
        notificacoes
      }
    ]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ status: "config_atualizada", data });
}
