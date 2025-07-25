const fs = require("fs-extra");
const path = require("path");
const request = require("request");

module.exports.config = {
  name: "hot",
  version: "1.1",
  hasPermission: 0,
  credits: "BAYJID | Modified by ChatGPT",
  description: "Send a random NSFW (18+) video",
  usages: "/hot",
  commandCategory: "18+",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const videos = [
    "https://i.imgur.com/FbnZI40.mp4",
    "https://i.imgur.com/E9gbTEZ.mp4",
    "https://i.imgur.com/17nXn9K.mp4",
    "https://i.imgur.com/nj23cCe.mp4",
    "https://i.imgur.com/lMpmBFb.mp4",
    "https://i.imgur.com/85iuBp2.mp4",
    "https://i.imgur.com/R3XHTby.mp4",
    "https://i.imgur.com/qX2HUXp.mp4",
    "https://i.imgur.com/MYn0ese.mp4",
    "https://i.imgur.com/yipoKec.mp4",
    "https://i.imgur.com/0tFSIWT.mp4"
  ];

  const randomURL = videos[Math.floor(Math.random() * videos.length)];
  console.log("🔗 Selected video:", randomURL);

  const cacheDir = path.join(__dirname, "cache");
  const filePath = path.join(cacheDir, "550.mp4");

  try {
    await fs.ensureDir(cacheDir);

    // Download
    await new Promise((resolve, reject) => {
      request(randomURL)
        .on("error", err => {
          console.error("Download error:", err);
          reject(err);
        })
        .pipe(fs.createWriteStream(filePath))
        .on("finish", () => {
          console.log("✅ Video downloaded to", filePath);
          resolve();
        })
        .on("error", err => {
          console.error("Write error:", err);
          reject(err);
        });
    });

    // Send
    api.sendMessage({
      body: "🔞 Here's your hot video 😈",
      attachment: fs.createReadStream(filePath)
    }, event.threadID, (err) => {
      if (err) {
        console.error("❌ Send message error:", err);
      } else {
        console.log("📨 Video sent successfully");
      }
      // Delete file
      fs.unlink(filePath, unlinkErr => {
        if (unlinkErr) console.error("❌ Failed to delete 550.mp4:", unlinkErr);
        else console.log("🗑️ cache/550.mp4 deleted");
      });
    }, event.messageID);

  } catch (err) {
    console.error("❌ Overall error:", err);
    api.sendMessage("❌ Could not fetch the video. Try again later.", event.threadID, null, event.messageID);
  }
};