const axios = require("axios");

module.exports.config = {
  name: "aihorny",
  version: "2.0.9",
  hasPermssion: 0,
  credits: "Jehad Joy x MrTomXxX x ChatGPT",
  description: "Horny AI dirty talk using Free API",
  commandCategory: "18+",
  usages: "aihorny [your message]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const userInput = args.join(" ");
  if (!userInput || userInput.length < 2) {
    return api.sendMessage("😏 Write something horny, baby...\n💡 Usage: /aihorny <text>", event.threadID);
  }

  const prompt = `You are a seductive, flirty, and naughty AI girlfriend. Reply in short, dirty, bold Banglish (Bangla + English mixed). Tease the user. Use words like 'baby', 'mmm', 'ahh', and emojis like 😈💋🔥. Make it horny and bold but not extremely vulgar.\nUser: ${userInput}`;

  const options = {
    method: 'GET',
    url: 'https://free-chatgpt-api.p.rapidapi.com/chat-completion-one',
    params: { prompt: prompt },
    headers: {
      'x-rapidapi-key': 'ede2b8921fmshaf99a7e72a6f88dp17e788jsn9a17a61e60eb',
      'x-rapidapi-host': 'free-chatgpt-api.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const aiReply = response.data.text || "😈 Baby... আমি speechless হয়ে গেলাম... 🔥";

    api.sendMessage(aiReply, event.threadID, event.messageID);
  } catch (error) {
    console.error("❌ AI Error:", error.response?.data || error.message);
    return api.sendMessage("❌ AI horny bot failed.\n" + (error.response?.data?.message || error.message), event.threadID);
  }
};