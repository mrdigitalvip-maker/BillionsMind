const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function insertRow(table, payload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL ou SUPABASE_ANON_KEY não configurados.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao salvar no Supabase.");
  }

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { user_id, mensagem, resposta } = req.body || {};

    if (!user_id || !mensagem || !resposta) {
      return res.status(400).json({ error: "Campos obrigatórios não enviados." });
    }

    const data = await insertRow("historico", [
      {
        user_id,
        mensagem_usuario: mensagem,
        resposta_ai: resposta,
      },
    ]);

    return res.status(200).json({ status: "salvo", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
