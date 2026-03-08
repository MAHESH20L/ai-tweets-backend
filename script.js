const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const typing = document.getElementById("typing");

const API_URL = "https://ai-tweets-backend.onrender.com";

let conversationState = {
    brand: null,
    industry: null,
    objective: null,
    product: null
};

let awaitingField = null;
let tweetsGenerated = false;
let waitingForAI = false;


/* ADD MESSAGE */

function addMessage(text, type) {

    const msg = document.createElement("div");
    msg.classList.add("message", type);

    if (type === "user") {

        const words = text.trim().split(/\s+/);
        const wordCount = words.length;

        const isSentence =
            wordCount > 3 ||
            text.toLowerCase().includes("create") ||
            text.toLowerCase().includes("generate") ||
            text.toLowerCase().includes("tweet") ||
            text.toLowerCase().includes("campaign");

        if (isSentence) {

            msg.innerHTML = `
                ${text}
                <span class="edit-icon" onclick="editMessage(\`${text}\`)">✏️</span>
            `;

        } else {

            msg.innerText = text;

        }

    } else {

        msg.innerText = text;

    }

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}


/* ADD HTML MESSAGE */

function addHTMLMessage(html, type) {

    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.innerHTML = html;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}


/* EDIT MESSAGE */

function editMessage(text) {

    input.value = text;
    input.focus();

    addHTMLMessage(`
    ✏️ <b>Edit Mode</b><br>
    Modify the message and press Enter to regenerate tweets.
    `, "bot");

}


/* TYPING */

function showTyping() {
    typing.classList.remove("hidden");
}

function hideTyping() {
    typing.classList.add("hidden");
}


/* ENTER KEY */

function handleKey(event) {
    if (event.key === "Enter") sendMessage();
}


/* WELCOME */

window.onload = () => {

    setTimeout(() => {

        addMessage("Hi 👋 I'm your AI tweet assistant.", "bot");

        addMessage(
`Tell me about the brand and campaign.

Example:
Create promotional tweets for Apple Smart Watch`,
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


    if (text.includes("exit") || text.includes("stop") || text.includes("bye")) {

        addMessage("Ok 👍 Come back when you need more tweets!", "bot");

        resetConversation();
        return;

    }


    if (awaitingField) {

        conversationState[awaitingField] = userText;
        awaitingField = null;

    }
    else {

        await detectFields(userText);

    }


    if (!conversationState.brand) {

        awaitingField = "brand";
        addMessage("What is the brand name?", "bot");
        return;

    }

    if (!conversationState.industry) {

        awaitingField = "industry";
        addMessage("What industry is the brand in?", "bot");
        return;

    }

    if (!conversationState.objective) {

        awaitingField = "objective";
        addMessage("What is the campaign objective? (Promotion / Engagement / Awareness)", "bot");
        return;

    }

    if (!conversationState.product) {

        awaitingField = "product";
        addMessage("What product should we promote?", "bot");
        return;

    }


    addMessage("Perfect! Generating tweets for you...", "bot");

    await generateTweets();

}



/* DETECT FIELDS */

async function detectFields(userText) {

    try {

        waitingForAI = true;
        showTyping();

        const res = await fetch(`${API_URL}/extract`, {

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

        if (data.brand) conversationState.brand = data.brand;
        if (data.industry) conversationState.industry = data.industry;
        if (data.objective) conversationState.objective = data.objective;
        if (data.product) conversationState.product = data.product;

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

        const res = await fetch(`${API_URL}/generate`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(conversationState)

        });

        const data = await res.json();

        hideTyping();

        displayStructuredTweets(data);

        tweetsGenerated = true;

        addHTMLMessage(`
        Type <b>more</b> → Generate more tweets<br>
        Type <b>exit</b> → End chat
        `, "bot");

    }
    catch (error) {

        hideTyping();
        addMessage("⚠️ AI server error.", "bot");

    }

    waitingForAI = false;

}



/* DISPLAY OUTPUT */

function displayStructuredTweets(data) {

    let html = "";

    if (data.summary?.length) {

        html += `<div class="section">
        <b>📌 Brand & Product Summary</b><br><br>`;

        data.summary.forEach(point => {
            html += `• ${point}<br>`;
        });

        html += `</div><br>`;
    }


    if (data.brand_tone?.length) {

        html += `<div class="section">
        <b>🎯 Brand Tone</b><br><br>`;

        data.brand_tone.forEach(tone => {
            html += `• ${tone}<br>`;
        });

        html += `</div><br>`;
    }


    if (data.target_audience) {

        html += `<div class="section">
        <b>👥 Target Audience</b><br><br>
        ${data.target_audience}
        </div><br>`;
    }


    if (data.content_themes?.length) {

        html += `<div class="section">
        <b>🧠 Content Themes</b><br><br>`;

        data.content_themes.forEach(theme => {
            html += `• ${theme}<br>`;
        });

        html += `</div><br>`;
    }


    html += `<div class="section">
    <b>🐦 Generated Tweets</b><br><br>`;


    if (!data.tweets?.length) {

        html += "No tweets generated.";

    } else {

        data.tweets.forEach((tweet, index) => {

            let text = typeof tweet === "string" ? tweet : tweet.text || tweet.tweet || "";
            let style = tweet.style || "";
            let viral = tweet.viral_score || "";

            html += `
            <div class="tweet-card">

                <b>Tweet ${index + 1}</b>
                <span class="copy-btn" onclick="copyTweet(\`${text}\`)">📋</span>

                <div class="tweet-text">${text}</div>

                ${style ? `<div class="tweet-style"><i>${style}</i></div>` : ""}

                ${viral ? `<div class="viral-score">🔥 Viral Chance: ${viral}/10</div>` : ""}

            </div>
            `;
        });
    }

    html += `</div>`;

    addHTMLMessage(html, "bot");

}


/* COPY */

function copyTweet(text) {

    navigator.clipboard.writeText(text);

    addHTMLMessage(`<i>Tweet copied ✔</i>`, "bot");

}


/* RESET */

function resetConversation() {

    conversationState = {
        brand: null,
        industry: null,
        objective: null,
        product: null
    };

    awaitingField = null;
    tweetsGenerated = false;

}
