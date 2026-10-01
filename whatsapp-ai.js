import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const API_URL = "https://masood-mobile-ai.vercel.app/api/chat";
const sentByAI = new Set();
async function sendAIMessage(message, text) {
    sentByAI.add(text);
    await message.reply(text);
}
const { Client, LocalAuth } = pkg;


const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "masood-ai"
    }),
    puppeteer: {
        headless: false
    }
});

client.on("qr", (qr) => {
    console.log("Scan this QR code with WhatsApp:");
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("WhatsApp authenticated successfully.");
});

client.on("ready", () => {
    console.log("");
    console.log("=================================");
    console.log("MASOOD AI WHATSAPP ASSISTANT READY");
    console.log("=================================");
    console.log("");
    console.log("Your WhatsApp account is connected.");
});

client.on("message_create", async (message) => {

    if (message.from.endsWith("@g.us")) {
        return;
    }

    console.log("");
    console.log("---------------------------------");
    console.log("MESSAGE RECEIVED");
    console.log("From:", message.from);
    console.log("From Me:", message.fromMe);
console.log("ID:", message.id);
    console.log("Message:", message.body);
    console.log("---------------------------------");
if (message.fromMe && sentByAI.has(message.body)) {
    sentByAI.delete(message.body);
    return;
}

    try {

        const text = message.body.trim();

       // ADMIN COMMANDS
if (message.fromMe) {

    // REMEMBER
    if (text.toLowerCase().startsWith("/remember ")) {

        const information = text.substring(10).trim();

        if (information.length === 0) {
        await sendAIMessage(
    message,
    "Please write the information after /remember."
);
            return;
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Remember that " + information
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Memory save failed."
            );
        }

       await sendAIMessage(
    message,
    "Information permanently remembered."
);

        return;
    }

    // FORGET
    if (text.toLowerCase().startsWith("/forget ")) {

        const information = text.substring(8).trim();

        if (information.length === 0) {
            await sendAIMessage(
    message,
    "Please write what you want me to forget after /forget."
);
            return;
        }

        const response = await fetch(
            "https://masood-mobile-ai.vercel.app/api/memory",
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    information: information
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Memory deletion failed."
            );
        }

       await sendAIMessage(
    message,
    data.message || "Memory updated."
);

        return;
    }

    // MEMORY
    if (text.toLowerCase() === "/memory") {

        const response = await fetch(
            "https://masood-mobile-ai.vercel.app/api/memory"
        );

        const memory = await response.json();

        if (!response.ok) {
            throw new Error(
                memory.error || "Could not retrieve memory."
            );
        }

        let reply = "SAVED MEMORY\n\n";

        reply += "PERMANENT:\n";

        if (
            !memory.permanent ||
            memory.permanent.length === 0
        ) {
            reply += "None\n";
        } else {
            memory.permanent.forEach(
                function(item, index) {
                    reply +=
                        (index + 1) +
                        ". " +
                        item.text +
                        "\n";
                }
            );
        }

        reply += "\nDAILY:\n";

        if (
            !memory.daily ||
            memory.daily.length === 0
        ) {
            reply += "None\n";
        } else {
            memory.daily.forEach(
                function(item, index) {
                    reply +=
                        (index + 1) +
                        ". " +
                        item.text +
                        "\n";
                }
            );
        }

        await sendAIMessage(
    message,
    reply
);

        return;
    }

    // HELP
    if (text.toLowerCase() === "/help") {

        await sendAIMessage(
    message,
    "ADMIN COMMANDS:\n\n" +
    "/remember [permanent information]\n" +
    "/forget [information]\n" +
    "/memory\n" +
    "/help"
);

        return;
    }

    
}
        

        // ======================================
        // NORMAL AI QUESTION
        // ======================================

     
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        message: text
    })
});

const data = await response.json();

if (!response.ok) {
    throw new Error(
        data.error || "Vercel API request failed."
    );
}

const aiReply = data.reply;

        console.log("");
        console.log("AI REPLY:");
        console.log(aiReply);

        sentByAI.add(aiReply);
await message.reply(aiReply);

        console.log("AI reply SENT successfully.");

    } catch (error) {

        console.error("");
        console.error("AI ERROR:");
        console.error(error);
    }
});

client.on("disconnected", (reason) => {

    console.log(
        "WhatsApp disconnected:",
        reason
    );
});

client.initialize();