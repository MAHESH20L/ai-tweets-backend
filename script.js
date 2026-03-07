const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const typing = document.getElementById("typing");

let conversationState = {
    brand: null,
    industry: null,
    objective: null,
    product: null
};

let tweetsGenerated = false;
let waitingForAI = false;


/* add message */

function addMessage(text, type) {

    const msg = document.createElement("div");

    msg.classList.add("message", type);

    msg.innerText = text;

    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;

}


/* typing animation */

function showTyping() {
    typing.classList.remove("hidden");
}

function hideTyping() {
    typing.classList.add("hidden");
}


/* enter key */

function handleKey(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

}


/* welcome message */

window.onload = () => {

    setTimeout(() => {

        addMessage("Hi 👋 I'm your AI tweet assistant.", "bot");

        addMessage(
`Tell me about the brand and campaign.

Example:
Create promotional tweets for Nike running shoes`,
        "bot");

    }, 500);

};



/* MAIN MESSAGE HANDLER */

async function sendMessage() {

    if (waitingForAI) return;

    const userText = input.value.trim();
    const text = userText.toLowerCase();

    if (!text) return;

    addMessage(userText, "user");

    input.value = "";


    if (text.includes("exit") || text.includes("bye")) {

        addMessage("Ok 👍 Come back when you need more tweets!", "bot");

        resetConversation();

        return;

    }


    if (
        text.includes("help") ||
        text.includes("how") ||
        text.includes("what") ||
        text.includes("why") ||
        text.includes("tips") ||
        text.includes("?")
    ) {

        addMessage("Sure 👍 Let me help with that...", "bot");

        await askAI(userText);

        return;

    }


    if (tweetsGenerated) {

        if (text.includes("more") || text.includes("yes")) {

            addMessage("Generating more tweets...", "bot");

            await generateTweets();

            return;

        }

        if (text.includes("no")) {

            addMessage("Alright 👍 See you later!", "bot");

            resetConversation();

            return;

        }

    }


    /* detect fields using AI */

    await detectFields(userText);


    /* check missing fields */

    if (!conversationState.brand) {

        addMessage("What is the brand name?", "bot");

        return;

    }

    if (!conversationState.industry) {

        addMessage("What industry is the brand in?", "bot");

        return;

    }

    if (!conversationState.objective) {

        addMessage("What is the campaign objective? (Promotion / Engagement / Awareness)", "bot");

        return;

    }

    if (!conversationState.product) {

        addMessage("What product should we promote?", "bot");

        return;

    }


    /* generate tweets */

    addMessage("Perfect! Generating tweets for you...", "bot");

    await generateTweets();

}



/* DETECT FIELDS USING BACKEND AI */

async function detectFields(userText) {

    try {

        waitingForAI = true;

        showTyping();

        const res = await fetch("https://ai-tweets-backend.onrender.com/extract", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: userText
            })

        });

        const data = await res.json();

        hideTyping();

        if (data.brand && !conversationState.brand)
            conversationState.brand = data.brand;

        if (data.industry && !conversationState.industry)
            conversationState.industry = data.industry;

        if (data.objective && !conversationState.objective)
            conversationState.objective = data.objective;

        if (data.product && !conversationState.product)
            conversationState.product = data.product;

    }
    catch (error) {

        hideTyping();

        addMessage("⚠️ AI extraction error.", "bot");

    }

    waitingForAI = false;

}



/* GENERATE TWEETS */

async function generateTweets() {

    try {

        waitingForAI = true;

        showTyping();

        const res = await fetch("https://ai-tweets-backend.onrender.com/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(conversationState)

        });

        const data = await res.json();

        hideTyping();

        addMessage(data.result, "bot");

        tweetsGenerated = true;

        addMessage("Do you want more tweets? (yes / more / exit)", "bot");

    }
    catch (error) {

        hideTyping();

        addMessage("⚠️ AI server error.", "bot");

    }

    waitingForAI = false;

}



/* ASK AI */

async function askAI(question) {

    try {

        waitingForAI = true;

        showTyping();

        const res = await fetch("https://ai-tweets-backend.onrender.com/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                userMessage: question
            })

        });

        const data = await res.json();

        hideTyping();

        addMessage(data.result, "bot");

    }
    catch (error) {

        hideTyping();

        addMessage("⚠️ AI server error.", "bot");

    }

    waitingForAI = false;

}



/* RESET */

function resetConversation() {

    conversationState = {
        brand: null,
        industry: null,
        objective: null,
        product: null
    };

    tweetsGenerated = false;

}