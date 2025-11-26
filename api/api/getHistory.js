const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: "Configurações do Supabase ausentes." });
  }

  const { user_id } = req.query || {};
  if (!user_id) {
    return res.status(400).json({ error: "user_id é obrigatório" });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/historico?user_id=eq.${user_id}&select=*&order=criado_em.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Erro ao buscar histórico");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}
