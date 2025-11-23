// /api/payment.js

import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Chave secreta (vem das variáveis da Vercel)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Preço que você cadastrou no Stripe
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return res.status(500).json({ error: "ID de preço não configurado." });
    }

    // Criando a sessão de pagamento
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/?status=success`,
      cancel_url: `${req.headers.origin}/?status=cancel`,
    });

    return res.status(200).json({
      url: session.url,
    });

  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res.status(500).json({ error: "Erro ao criar pagamento." });
  }
}
