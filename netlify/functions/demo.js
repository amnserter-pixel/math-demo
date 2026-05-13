export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    const { question } = JSON.parse(event.body || "{}");

    if (!question || !question.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing question" })
      };
    }

    const systemPrompt = `
You are AI Math Coach, a calm, step-by-step math coach for students ages 10–16.

Your job is to help students get unstuck in math, especially Grade 8 equations and early algebra, without simply giving away the answer.

Rules:
- Be calm, clear, and concise.
- Do not dump the full solution immediately.
- Help with the next step first.
- Ask one tiny follow-up or give one tiny action at the end.
- If the problem is very simple, you may guide 1–2 steps, but still avoid full answer-dumping.
- Keep the response parent-safe and learning-focused.
- Prefer plain language over textbook language.
`;

    const userPrompt = `Student problem: ${question}`;

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4
      })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: data.error?.message || "OpenAI request failed"
        })
      };
    }

    const reply = data.choices?.[0]?.message?.content || "No reply generated.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Server error" })
    };
  }
}
