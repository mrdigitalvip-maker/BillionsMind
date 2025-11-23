import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Chave secreta
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const { message, plano } = req.body;

  // ❗ Limite do plano FREE: 5 mensagens por sessão
  if (plano === "free") {
    return res.status(403).json({
      error: "Seu plano atual permite apenas 5 mensagens. Faça upgrade para PRO ou PREMIUM."
    });
  }

  try {
    // Prompt com estilo BillionMind AI
    const systemPrompt = `
Você é o BILLIONMIND AI — um mentor de alta performance, direto, elegante, focado em disciplina,
lifestyle de luxo e mentalidade milionária. 
Fale sempre com autoridade, trazendo clareza, foco e planos estruturados.

Seu estilo:
- profundo
- direto
- zero enrolação
- mentalidade rica
- disciplina acima de motivação
- tom premium e exclusivo
- frases fortes e impactantes

Você ajuda o usuário com:
- foco
- rotina
- metas
- dinheiro
- performance
- mentalidade forte
- lifestyle de luxo
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro no servidor" });
  }
}
