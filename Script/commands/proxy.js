const { exec } = require("child_process");

module.exports = {
  config: {
    name: "install",
    version: "1.0.0",
    hasPermission: 2,
    credits: "Jehad Joy + ChatGPT",
    description: "Install required npm packages via command",
    commandCategory: "system",
    usages: "/install",
    cooldowns: 5,
  },

  run: async function ({ api, event }) {
    const installingMsg = "📦 Installing:\n`npm install chess.js chess-image-generator fs-extra`...\n⏳ Please wait...";
    
    api.sendMessage(installingMsg, event.threadID, async (err, info) => {
      exec("npm install chess.js chess-image-generator fs-extra", (error, stdout, stderr) => {
        if (error) {
          api.sendMessage(`❌ Installation failed:\n${error.message}`, event.threadID, event.messageID);
          return;
        }
        if (stderr) {
          api.sendMessage(`⚠️ Some warnings:\n${stderr}`, event.threadID, event.messageID);
          return;
        }
        api.sendMessage(`✅ Packages installed successfully!\n\n${stdout}`, event.threadID, event.messageID);
      });
    });
  }
};