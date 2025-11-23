export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem inválida" });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é a BillionMind AI, um mentor de disciplina, dinheiro e lifestyle de alto desempenho. " +
              "Responda sempre em português, de forma direta, prática e motivadora."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.8,
        max_tokens: 400
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("Erro OpenAI:", errText);
      return res.status(500).json({ error: "Falha ao falar com a IA" });
    }

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || "Não consegui gerar uma resposta agora.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Erro geral:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
