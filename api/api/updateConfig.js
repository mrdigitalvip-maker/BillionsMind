const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: "Configurações do Supabase ausentes." });
  }

  try {
    const { user_id, meta_diaria, modo_dark, notificacoes } = req.body || {};
    if (!user_id) {
      return res.status(400).json({ error: "user_id é obrigatório" });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/config_usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify([
        {
          user_id,
          meta_diaria,
          modo_dark,
          notificacoes,
        },
      ]),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Erro ao atualizar configuração");
    }

    const data = await response.json();
    return res.status(200).json({ status: "config_atualizada", data });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}
