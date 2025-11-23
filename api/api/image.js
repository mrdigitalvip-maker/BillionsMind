import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { prompt, plano, user_id } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt não enviado." });
  }

  if (plano === "free") {
    return res.status(403).json({
      error: "Geração de imagens é liberada apenas para PRO e PREMIUM."
    });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    // ✔ Gerar a imagem
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    const image_base64 = result.data[0].b64_json;

    // ✔ Converter para buffer
    const buffer = Buffer.from(image_base64, "base64");

    // ✔ Salvar no Supabase Storage
    const fileName = `img_${Date.now()}.png`;

    const upload = await supabase.storage
      .from("images")
      .upload(fileName, buffer, {
        contentType: "image/png"
      });

    if (upload.error) {
      console.error(upload.error);
      return res.status(500).json({ error: "Erro ao salvar imagem." });
    }

    const publicURL = supabase.storage
      .from("images")
      .getPublicUrl(fileName).data.publicUrl;

    // ✔ Retornar URL pública da imagem
    return res.status(200).json({ url: publicURL });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao gerar imagem." });
  }
}
