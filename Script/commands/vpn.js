const { exec } = require("child_process");

const fs = require("fs");

module.exports.config = {

  name: "vpn",

  version: "1.0",

  hasPermssion: 2, // শুধু অ্যাডমিন চালাতে পারবে

  credits: "Jehad Joy",

  description: "VPN চালু করার কমান্ড",

  commandCategory: "System",

  usages: "/vpn",

  cooldowns: 5

};

module.exports.run = async function ({ api, event }) {

  const shellPath = "./vpn.sh";

  // ✅ vpn.sh ফাইল আছে কিনা চেক করি

  if (!fs.existsSync(shellPath)) {

    return api.sendMessage("❌ vpn.sh ফাইল খুঁজে পাওয়া যায়নি!", event.threadID, event.messageID);

  }

  // ✅ প্রথমে executable permission দাও

  exec(`chmod +x ${shellPath}`, (err) => {

    if (err) {

      return api.sendMessage("❌ chmod error: " + err.message, event.threadID, event.messageID);

    }

    // ✅ তারপর VPN connect করার চেষ্টা

    exec(`bash ${shellPath}`, (error, stdout, stderr) => {

      if (error) {

        return api.sendMessage("❌ VPN connect করতে ব্যর্থ:\n" + error.message, event.threadID, event.messageID);

      }

      return api.sendMessage("✅ VPN চালু হয়েছে!\nআপনি এখন Facebook API ব্যবহার করতে পারবেন।", event.threadID, event.messageID);

    });

  });

};