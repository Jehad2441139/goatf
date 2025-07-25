const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "horny",
    version: "1.0.4",
    hasPermssion: 0,
    credits: "JEHAD (fixed like music.js)",
    description: "Send a random adult video",
    commandCategory: "18+",
    usages: "",
    cooldowns: 5,
  },

  run: async function ({ api, event }) {
    const { threadID, messageID } = event;

    const videoLinks = [
      "https://i.imgur.com/FbnZI40.mp4",
      "https://i.imgur.com/17nXn9K.mp4",
      "https://i.imgur.com/nj23cCe.mp4",
      "https://i.imgur.com/R3XHTby.mp4",
      "https://i.imgur.com/MYn0ese.mp4",
      "https://i.imgur.com/aDlwRWy.mp4",
      "https://i.imgur.com/Zp5sci1.mp4",
      "https://i.imgur.com/S6rHOc1.mp4",
      "https://i.imgur.com/cAHRfq3.mp4",
      "https://i.imgur.com/fL1igWD.mp4",
      "https://i.imgur.com/ZRt0bGT.mp4",
      "https://i.imgur.com/fAKWP0W.mp4"
    ];

    // Filter out broken/empty
    const validLinks = videoLinks.filter(link => !!link);
    const videoURL = validLinks[Math.floor(Math.random() * validLinks.length)];

    // Create cache path
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, "4445.mp4");

    // Notify user
    const wait = await api.sendMessage("📥 Downloading hot content, please wait...", threadID);

    try {
      // Download video like music.js
      const res = await axios.get(videoURL, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data));

      // Send video
      await api.sendMessage(
        {
          body: "sex 😻",
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => {
          fs.unlinkSync(filePath); // delete file
          api.unsendMessage(wait.messageID);
        },
        messageID
      );

    } catch (err) {
      console.error("HORNY CMD ERROR:", err.message);
      return api.sendMessage("❌ Failed to send the video. File too big or URL invalid.", threadID, messageID);
    }
  }
};