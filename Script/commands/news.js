const axios = require("axios");

module.exports.config = {
  name: "news",
  version: "1.0.2",
  hasPermission: 0,
  credits: "Jehad Joy",
  description: "বাংলাদেশের সর্বশেষ সংবাদ বাংলায় দেখুন",
  commandCategory: "news",
  usages: "/news",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const API_KEY = "pub_388e2cf4f71a465a82f4195a9acfe4f0";
  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=bn&country=bd&category=top`;

  try {
    const res = await axios.get(url);
    const articles = res.data.results;

    if (!articles || articles.length === 0) {
      return api.sendMessage("😕 দুঃখিত, এখন কোনো বাংলা খবর পাওয়া যাচ্ছে না।", event.threadID, event.messageID);
    }

    let message = "📰 বাংলাদেশের সর্বশেষ সংবাদ (বাংলা):\n\n";
    for (let i = 0; i < Math.min(5, articles.length); i++) {
      const news = articles[i];
      message += `🔸 ${news.title}\n🌐 উৎস: ${news.source_id || "অজানা"}\n🔗 ${news.link}\n\n`;
    }

    api.sendMessage(message.trim(), event.threadID, event.messageID);

  } catch (error) {
    console.error("News Fetch Error:", error.message);
    api.sendMessage("❌ দুঃখিত, বাংলাদেশের বাংলা খবর আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};