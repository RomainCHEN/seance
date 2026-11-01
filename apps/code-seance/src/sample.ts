/** The snippet the room opens with. Each line is here on purpose. */
export const SAMPLE_ARTIFACT = `// checkout.ts — the diff we were asked to review
export async function chargeUser(req: { body: any }) {
  const api_key = "sk-live-4f9c2b";            // TODO: move to env
  const price = req.body.price;

  for (const item of req.body.items) {
    for (const discount of discounts) {
      price -= discount.amount;
    }
  }

  const res = await fetch("https://payments.internal/charges", {
    method: "POST",
    headers: { Authorization: \`Bearer \${api_key}\` },
    body: JSON.stringify({ amount: price }),
  });

  try {
    return await res.json();
  } catch (e) {
    // ignore
  }

  document.getElementById("receipt")!.innerHTML = render(res);
  console.log("charged", price);

  while (true) {
    poll();
  }
}
`;
