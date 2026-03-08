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
    "HTTP-Referer": "http://localhost:3000",
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

Return ONLY valid JSON.

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
      temperature: 0,
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const aiText = completion.choices[0].message.content;

    console.log("AI Response:", aiText);

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
You are an expert AI social media strategist.

Your task is to analyze the brand and campaign information.

First infer the following:

1. Brand & Product Summary
• Write 3 bullet points summarizing the brand and product.

2. Brand Tone
Examples: witty, premium, humorous, bold, minimal, informative.

3. Target Audience
Describe the likely audience for this campaign.

4. Content Themes
Examples:
- promotions
- product features
- educational tips
- industry trends
- memes
- community engagement

After analysis, generate tweets.

Return response ONLY in valid JSON using this format:

{
 "summary": [],
 "brand_tone": [],
 "target_audience": "",
 "content_themes": [],
 "tweets": []
}

Rules:

Summary
- 3 bullet points summarizing brand & product

Brand Tone
- 3 bullet points

Content Themes
- 4 to 6 themes

Tweets
Generate 10 tweets using a mix of styles:
• engaging / conversational
• promotional
• witty / meme-style
• informative / value-driven

Tweet rules:
- short and catchy
- maximum 200 characters
- avoid repeating ideas
- natural social media tone
`;

    const userPrompt = `
User Message:
${userMessage || ""}

Brand: ${brand || "Unknown"}
Industry: ${industry || "Unknown"}
Campaign Objective: ${objective || "Unknown"}
Product: ${product || "Unknown"}

Analyze this information and generate tweet content.
`;

    const completion = await client.chat.completions.create({

      model: "meta-llama/llama-3.1-8b-instruct",
      temperature: 0.8,
      max_tokens: 900,

      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]

    });

    const aiText = completion.choices[0].message.content;

    console.log("AI Raw Output:", aiText);

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    let result = {
      summary: [],
      brand_tone: [],
      target_audience: "",
      content_themes: [],
      tweets: []
    };

    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.log("JSON parse failed");
      }
    }

    res.json(result);

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
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});