export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const checkoutUrl = process.env.STRIPE_CHECKOUT_URL;

  if (!checkoutUrl) {
    return res.status(200).json({
      url: null,
      note:
        "Defina STRIPE_CHECKOUT_URL no ambiente para redirecionar para o pagamento real.",
    });
  }

  return res.status(200).json({ url: checkoutUrl });
}
