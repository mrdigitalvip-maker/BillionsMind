export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { prompt, plano } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Prompt não enviado." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY não configurada no ambiente." });
  }

  if (plano === "free") {
    return res.status(403).json({
      error: "Geração de imagens é liberada apenas para PRO e PREMIUM.",
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(err);
      return res.status(500).json({ error: "Erro ao gerar imagem." });
    }

    const data = await response.json();
    const image_base64 = data?.data?.[0]?.b64_json;

    if (!image_base64) {
      return res.status(500).json({ error: "Não foi possível obter a imagem gerada." });
    }

    return res.status(200).json({
      // Retornar data URI simplifica a visualização local mesmo sem bucket configurado
      url: `data:image/png;base64,${image_base64}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao gerar imagem." });
  }
}
