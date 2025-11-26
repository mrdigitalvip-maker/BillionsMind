const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function missingConfig(res) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(500).json({ error: "Configurações do Supabase ausentes no ambiente." });
    return true;
  }
  return false;
}

async function createUser(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
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
    throw new Error(err || "Erro ao criar usuário");
  }

  return response.json();
}

async function createStarterPlan(userId, email) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/usa_planos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify([{ id: userId, email, plano: "free", renovacao: null }]),
  });

  if (!response.ok) {
    console.warn("Não foi possível salvar plano inicial", await response.text());
  }
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

    const authData = await createUser(email, password);
    const userId = authData?.user?.id;

    if (userId) {
      await createStarterPlan(userId, email);
    }

    return res.status(200).json({ message: "Conta criada com sucesso!", user: authData.user });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}
