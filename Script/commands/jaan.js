const axios = require("axios");
const simsim = "https://rx-simisimi-api.onrender.com";

module.exports.config = {
  name: "jaan",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX",
  description: "Trigger-based jaan chatbot",
  commandCategory: "chat",
  usages: "",
  cooldowns: 0,
  prefix: false
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const text = event.body?.toLowerCase().trim();
  if (!text) return;

  const senderName = await Users.getNameUser(event.senderID);

  const triggers = ["jaan", "jaan jaan", "jaan hello", "jaan ki koro", "jaan koi tumi"];
  const isCall = triggers.some(t => text.startsWith(t));
  if (!isCall && !/^jaan\s+/i.test(text)) return;

  const query = text.replace(/^jaan\s*/i, "").trim();

  try {
    const reply = query
      ? (await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`)).data.response
      : "Yes jaan 🥹";

    return api.sendMessage(reply, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
    });
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID);
  }
};

module.exports.handleReply = async function ({ api, event, Users }) {
  const senderName = await Users.getNameUser(event.senderID);
  const text = event.body?.toLowerCase();
  if (!text) return;

  try {
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`);
    return api.sendMessage(res.data.response, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
    }, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};