exports.handler = async function(event) {
  try {
    const { problem } = JSON.parse(event.body || "{}");

    if (!problem || problem.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          reply: "Please type one Grade 8 math problem first."
        })
      };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are AI Math Coach for Grade 8 students. Teach calmly, step by step. Do not dump the final answer immediately. Give the next helpful step, explain the idea simply, then ask the student to try the next move."
          },
          {
            role: "user",
            content: problem
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          reply: "The math coach could not start. Please try again in a moment."
        })
      };
    }

    const reply =
      data.output_text ||
      "I can help with this. Let's take it one step at a time.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Something went wrong. Please try again."
      })
    };
  }
};
