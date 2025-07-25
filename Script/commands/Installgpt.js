const { exec } = require("child_process");

module.exports.config = {

  name: "install",

  version: "1.0.0",

  hasPermission: 2,

  credits: "Jehad Joy x ChatGPT",

  description: "Install required npm packages",

  commandCategory: "system",

  usePrefix: true,

  cooldowns: 5,

};

module.exports.run = async ({ api, event, args }) => {

  if (args[0] === "gpt") {

    api.sendMessage("🛠️ Installing required packages for GPT...", event.threadID);

    exec("npm install openai", (error, stdout, stderr) => {

      if (error) {

        console.error(`Install error: ${error.message}`);

        return api.sendMessage("❌ Installation failed. Check console.", event.threadID);

      }

      if (stderr) {

        console.error(`stderr: ${stderr}`);

        return api.sendMessage("⚠️ Installed with warnings. Check console.", event.threadID);

      }

      console.log(`stdout: ${stdout}`);

      api.sendMessage("✅ Successfully installed `openai`. Now you can use the `gpt` command.", event.threadID);

    });

  } else {

    api.sendMessage("❓ Example: /install gpt", event.threadID);

  }

};