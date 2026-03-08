**AI  Tweet Generator**
* An AI-powered tweet generation tool that helps marketers and creators generate brand-aligned tweets based on campaign inputs like brand name, product, industry, and campaign objective.
* An AI-powered tweet generation tool that helps marketers and creators generate brand-aligned tweets based on campaign inputs like brand name, product, industry, and campaign objective.
  
**Features**
* AI-powered tweet generation.
• Chat-based interactive interface.
• Automatic extraction of campaign details.
• Brand tone and audience analysis.
• Content theme identification.
• Generates 10 tweets per request.
• Viral score estimation for tweets.
• Edit previous prompts easily.
• Generate more tweets on demand.
• Clean structured output format.

**System Architecture**

```mermaid
flowchart TD
    UI[User Chat Interface]
    FE[Frontend HTML CSS JavaScript]
    BE[Backend API Node.js Express]
    AI[OpenRouter AI Llama 3.1 8B]
    OUT[Brand Analysis and Generated Tweets]

    UI --> FE
    FE --> BE
    BE --> AI
    AI --> OUT
```

**Wrokflow**

```mermaid
flowchart TD
    UI[User enters prompt]
    FE[Frontend script.js handles the prompt]
    BE[Backend server.js initiates API Call]
    OR[Openrouter API is called so meta-llama-3.1-8b model is used ,Brand Analysis + NLP]
    AI[Model analyzes Summary, Brandtone, Target Audience, context themes, tweets]
    FO[Sends raw json data back to backend]
    FR[User see's the output, if not satisfied can click more option for more tweets]

    UI --> FE
    FE --> BE
    BE --> OR
    OR --> AI
    AI --> FO
    FO --> FR
```
    
 
