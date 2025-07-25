const axios = require('axios');

const OPENROUTER_KEY = "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"; // 🔒 Keep private

module.exports.config = {
  name: "gojo",
  version: "2.0",
  credits: "Jehad Joy",
  cooldowns: 0,
  hasPermssion: 0,
  description: "Flirty chat with Gojo-style AI (via OpenRouter)",
  commandCategory: "ai",
  category: "ai",
  usePrefix: true,
  prefix: true,
  usages: "[your message]",
};

async function fetchGojoReply(prompt, uid) {
  const body = {
    model: "mistralai/mixtral-8x7b-instruct", // good for spicy chat
    messages: [
      {
        role: "system",
        content: "You're a flirty, teasing anime boyfriend named Gojo. Be sweet, romantic, and slightly naughty but never explicit."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  };

  const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", body, {
    headers: {
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json"
    }
  });

  return res.data.choices[0].message.content;
}

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    const uid = event.senderID;

    if (!prompt) {
      return api.sendMessage("🗣️ Say something to Gojo!\nExample: gojo hi babe", event.threadID, event.messageID);
    }

    await api.sendMessage("🔍 Gojo is thinking...", event.threadID, event.messageID);

    const reply = await fetchGojoReply(prompt, uid);
    return api.sendMessage(reply, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: uid
        });
      }
    }, event.messageID);

  } catch (e) {
    console.error("Gojo Error:", e);
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  try {
    if (event.senderID !== handleReply.author) return;
    const reply = await fetchGojoReply(event.body, event.senderID);
    return api.sendMessage(reply, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    }, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const body = event.body?.toLowerCase() || "";
    if (!body.startsWith("gojo")) return;

    const text = body.replace(/^gojo\s*/, "");
    const uid = event.senderID;

    if (!text) {
      return api.sendMessage("💬 Gojo is here... say something romantic!", event.threadID, (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: uid
        });
      }, event.messageID);
    }

    const reply = await fetchGojoReply(text, uid);
    return api.sendMessage(reply, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: uid
      });
    }, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};