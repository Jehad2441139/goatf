const axios = require('axios');

module.exports = {
  config: {
    name: "gojo",
    aliases: [],
    version: "2.0",
    author: "deku",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "Talk to GOJO AI"
    },
    longDescription: {
      en: "Chat with Gojo Satoru AI (blindfolded sorcerer)."
    },
    category: "ai",
    guide: {
      en: "{pn} <your message>\nExample: {pn} hello"
    }
  },

  run: async function ({ message, event, args }) {
    const prompt = args.join(' ');
    const id = event.senderID;
    const url = "http://eu4.diresnode.com:3301";

    if (!prompt) {
      return message.reply(`❌ Missing message.\n\nTo talk to Gojo, use:\n gojo <your message>`);
    }

    try {
      message.reply("🔍 Gojo is thinking...");
      const res = await axios.get(`${url}/gojo_gpt?prompt=${encodeURIComponent(prompt)}&idd=${id}`);
      return message.reply(res.data.gojo);
    } catch (err) {
      return message.reply("❌ Error: " + err.message);
    }
  }
};