import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { user_id } = req.query;

  const { data, error } = await supabase
    .from("historico")
    .select("*")
    .eq("user_id", user_id)
    .order("criado_em", { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}
