const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function missingConfig(res) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(500).json({ error: "Configurações do Supabase ausentes no ambiente." });
    return true;
  }
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (missingConfig(res)) return;

  try {
    const { user_id, titulo, conteudo } = req.body || {};
    if (!user_id || !titulo || !conteudo) {
      return res.status(400).json({ error: "Campos obrigatórios não enviados." });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/planos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify([{ user_id, titulo, conteudo }]),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Erro ao salvar plano");
    }

    const data = await response.json();
    return res.status(200).json({ status: "plano_criado", data });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}
