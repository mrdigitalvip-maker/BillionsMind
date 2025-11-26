const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function missingConfig(res) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(500).json({ error: "Configurações do Supabase ausentes no ambiente." });
    return true;
  }
  return false;
}

async function callSupabaseAuth(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Falha no login.");
  }

  return response.json();
}

async function fetchPlano(userId) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/usa_planos?id=eq.${userId}&select=*`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Não foi possível recuperar o plano");
  }

  const data = await response.json();
  return data?.[0] || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (missingConfig(res)) return;

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    const authData = await callSupabaseAuth(email, password);
    const user = authData.user || authData?.user_metadata || authData;

    let plano = null;
    if (user?.id) {
      try {
        plano = await fetchPlano(user.id);
      } catch (error) {
        console.warn("Falha ao carregar plano do usuário", error.message);
      }
    }

    return res.status(200).json({
      message: "Login bem-sucedido!",
      user,
      plano,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}
