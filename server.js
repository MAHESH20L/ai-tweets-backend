const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors());
app.use(express.json());

/* ---------------- OPENROUTER CLIENT ---------------- */

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://your-frontend-domain.com", // change after deployment
    "X-Title": "AI Tweet Generator"
  }
});

/* ---------------- HEALTH CHECK ---------------- */

app.get("/", (req, res) => {
  res.send("AI Tweet Generator API running 🚀");
});

/* ---------------- EXTRACT DATA ---------------- */

app.post("/extract", async (req, res) => {

  try {

    const { message } = req.body;

    const prompt = `
Extract the following marketing information from the user's message.

Return ONLY JSON.

Fields:
brand
industry
objective
product

If a field is missing return null.

Example:
{
 "brand": "Nike",
 "industry": "Sportswear",
 "objective": "Promotion",
 "product": "Running shoes"
}

User message:
${message}
`;

    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const aiText = completion.choices[0].message.content;

    console.log("AI Response:", aiText);

    /* -------- SAFE JSON EXTRACTION -------- */

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    let extracted = {
      brand: null,
      industry: null,
      objective: null,
      product: null
    };

    if (jsonMatch) {

      try {
        extracted = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.log("JSON parse failed");
      }

    }

    res.json(extracted);

  } catch (error) {

    console.error("Extraction error:", error);

    res.status(500).json({
      error: "Failed to extract information"
    });

  }

});

/* ---------------- GENERATE TWEETS ---------------- */

app.post("/generate", async (req, res) => {

  try {

    const { brand, industry, objective, product, userMessage } = req.body;

    console.log("Incoming request:", req.body);

    const systemPrompt = `
You are an intelligent AI social media assistant.

Rules:
- Understand the user's intent.
- Respond in the same tone as the user.
- If the user asks for tweets, generate tweets.
- Do not repeat questions.

When generating tweets:
• First summarize the brand voice in 3 bullet points.
• Then generate 10 engaging tweets.
• Tweets must be short and catchy.
`;

    const userPrompt = `
User message: ${userMessage || ""}

Brand: ${brand || ""}
Industry: ${industry || ""}
Campaign Objective: ${objective || ""}
Product: ${product || ""}
`;

    const completion = await client.chat.completions.create({

      model: "meta-llama/llama-3.1-8b-instruct",

      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]

    });

    const result = completion.choices[0].message.content;

    res.json({ result });

  } catch (error) {

    console.error("OpenRouter error:", error);

    res.status(500).json({
      error: "Failed to generate response"
    });

  }

});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});