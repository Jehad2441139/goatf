const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const auddApiKey = "f8585c580abeece621bd1df7b00181a2";

module.exports.config = {
  name: "copyright",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "CyberJoy x ChatGPT",
  description: "Check if the replied video is copyrighted using AudD API",
  commandCategory: "media",
  usages: "[reply to a video] /copyright",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID, senderID } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("⚠️ ভিডিও রিপ্লাই করে কমান্ড দিন!", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "video") {
    return api.sendMessage("⚠️ দয়া করে শুধুমাত্র ভিডিও রিপ্লাই করুন!", threadID, messageID);
  }

  const videoUrl = attachment.url;
  const fileName = `${Date.now()}.mp4`;
  const filePath = path.join(__dirname, "cache", fileName);
  const audioPath = path.join(__dirname, "cache", `${Date.now()}.mp3`);

  const checkingMsg = await new Promise(resolve =>
    api.sendMessage("⏳ Checking copyright...", threadID, (err, info) => {
      if (!err) resolve(info.messageID);
    }, messageID)
  );

  // Show "still checking" after 10s
  const stillCheckingMsg = setTimeout(() => {
    api.sendMessage("⏳ Still checking...", threadID, (err, info) => {
      if (!err) setTimeout(() => api.unsendMessage(info.messageID), 5000);
    });
  }, 10000);

  try {
    const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, res.data);

    // Extract 15s audio using ffmpeg
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${filePath}" -t 15 -vn -ar 44100 -ac 2 -ab 192k -f mp3 "${audioPath}"`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const form = new FormData();
    form.append("file", fs.createReadStream(audioPath));
    form.append("api_token", auddApiKey);
    form.append("return", "timecode,apple_music,spotify");

    const response = await axios.post("https://api.audd.io/", form, {
      headers: form.getHeaders()
    });

    const result = response.data.result;
    clearTimeout(stillCheckingMsg);
    api.unsendMessage(checkingMsg);

    if (!result) {
      return api.sendMessage("❌ কোনো কপিরাইট গান শনাক্ত হয়নি। হয়তো অডিও স্পষ্ট নয়।", threadID, messageID);
    }

    const msg = `✅ গান শনাক্ত হয়েছে:\n\n🎵 শিরোনাম: ${result.title}\n🎤 শিল্পী: ${result.artist}\n💿 অ্যালবাম: ${result.album || "N/A"}\n📀 লেবেল: ${result.label || "N/A"}\n\n📢 কপিরাইট: ${result.copyright || "পাওয়া যায়নি"}`;

    api.sendMessage(msg, threadID, messageID);
  } catch (err) {
    clearTimeout(stillCheckingMsg);
    api.unsendMessage(checkingMsg);
    console.error(err);
    api.sendMessage("❌ কপিরাইট চেক করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।", threadID, messageID);
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
  }
};
