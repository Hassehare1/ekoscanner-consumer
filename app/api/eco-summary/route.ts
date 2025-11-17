import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { productName, brand, categories } = await req.json();

    
    console.log("Kallar OpenAI med modell gpt-3.5-turbo");
    console.log("EKO API key prefix:", process.env.OPENAI_API_KEY?.slice(0, 8));

    const prompt = `
Ge en kort, tydlig och lättförståelig miljö- och hållbarhetsbeskrivning.
Produkt: ${productName}
Varumärke: ${brand}
Kategorier: ${categories}
Max 4 meningar.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = completion.choices[0].message.content;

    return new Response(JSON.stringify({ summary }), { status: 200 });
  } catch (err: any) {
    console.error("AI-fel:", err?.response?.data || err?.message || err);
    return new Response(JSON.stringify({ error: "AI-fel" }), { status: 500 });
  }
}
