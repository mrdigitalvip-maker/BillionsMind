import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { email, password, name } = JSON.parse(req.body || "{}");

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  await supabase.from("profiles").insert({
    id: data.user.id,
    full_name: name || null,
  });

  return res.status(200).json({ user: data.user });
}
