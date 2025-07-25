const { exec } = require("child_process");

module.exports.config = {

  name: "install",

  version: "1.1.0",

  hasPermission: 2, // admin only (change to 0 if all users allowed)

  credits: "Jehad Joy x ChatGPT",

  description: "Install required npm packages like openai",

  commandCategory: "system",

  usePrefix: true,

  cooldowns: 5,

};

module.exports.run = async ({ api, event, args }) => {

  const threadID = event.threadID;

  const packageName = args[0];

  if (!packageName) {

    return api.sendMessage("❓ Usage: /install gpt", threadID);

  }

  if (packageName.toLowerCase() === "gpt") {

    api.sendMessage("⏳ Installing `openai` package. Please wait...", threadID);

    exec("npm install openai --save", (error, stdout, stderr) => {

      if (error) {

        console.error("Install error:", error);

        return api.sendMessage("❌ Installation failed. Error in console.", threadID);

      }

      if (stderr) {

        console.warn("Install warning:", stderr);

        api.sendMessage("⚠️ Installed with some warnings. Check console.", threadID);

      } else {

        api.sendMessage("✅ Successfully installed `openai` package.\nNow you can use the `gpt` command!", threadID);

      }

      console.log("Install stdout:", stdout);

    });

  } else {

    api.sendMessage("❌ Unknown install target. Only `/install gpt` is supported.", threadID);

  }

};