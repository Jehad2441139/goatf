const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports.config = {
  name: "help",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "Joy",
  description: "Get list of bot commands",
  commandCategory: "system",
  usages: "[name | all | page]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    delayUnsend: 20
  }
};

module.exports.languages = {
  en: {
    moduleInfo:
      "╭──────•◈•──────╮\n" +
      " |        𝗝𝗼𝘆 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁\n" +
      " |●𝗡𝗮𝗺𝗲: •—» %1 «—•\n" +
      " |●𝗨𝘀𝗮𝗴𝗲: %3\n" +
      " |●𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: %2\n" +
      " |●𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: %4\n" +
      " |●𝗪𝗮𝗶𝘁𝗶𝗻𝗴 𝘁𝗶𝗺𝗲: %5 seconds(s)\n" +
      " |●𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻: %6\n" +
      " |𝗠𝗼𝗱𝘂𝗹𝗲 𝗰𝗼𝗱𝗲 𝗯𝘆\n" +
      " |•—» Joy «—•\n" +
      "╰──────•◈•──────╯",
    helpList: '[ There are %1 commands on this bot, Use: "%2help nameCommand" to know how to use! ]',
    user: "User",
    adminGroup: "Admin group",
    adminBot: "Admin bot"
  }
};

// ✅ Optional: Auto-help reply on exact "help"
module.exports.handleEvent = function ({ api, event }) {
  const { body, threadID } = event;
  if (!body || body.toLowerCase().trim() !== "help") return;
  return api.sendMessage("📌 Type /help [command name] to get details.\nExample: /help play", threadID);
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
  const prefix = threadSetting.PREFIX || global.config.PREFIX;
  const image = "https://i.postimg.cc/xTDHY12J/images-13.jpg";

  const sendImage = (msgBody) => {
    const imgPath = __dirname + "/cache/helpimg.jpg";
    request(image).pipe(fs.createWriteStream(imgPath)).on("close", () => {
      api.sendMessage(
        { body: msgBody, attachment: fs.createReadStream(imgPath) },
        threadID,
        (err, info) => {
          fs.unlinkSync(imgPath);
          if (autoUnsend) {
            setTimeout(() => api.unsendMessage(info.messageID), delayUnsend * 1000);
          }
        },
        messageID
      );
    });
  };

  // ✅ Show grouped commands
  if (args[0] === "all") {
    let group = [], msg = "";
    for (const cmd of commands.values()) {
      const cat = cmd.config.commandCategory || "Uncategorized";
      const found = group.find(i => i.group === cat);
      if (found) found.cmds.push(cmd.config.name);
      else group.push({ group: cat, cmds: [cmd.config.name] });
    }

    for (const g of group) {
      msg += `🔹 ${g.group.toUpperCase()}\n${g.cmds.join(' • ')}\n\n`;
    }

    return sendImage(`📚 All Commands by Category 📚\n\n${msg}━━━━━━━━━━━━\n🔍 Use: ${prefix}help [name]\n👤 Owner: Joy\n📦 Total: ${commands.size}`);
  }

  // ✅ Show by page
  if (args[0] && !isNaN(args[0])) {
    const page = parseInt(args[0]);
    const perPage = 15;
    const list = Array.from(commands.keys()).sort();
    const pageCount = Math.ceil(list.length / perPage);
    if (page > pageCount || page < 1) return api.sendMessage(`❌ Page ${page} not found (1 - ${pageCount})`, threadID, messageID);

    const pageList = list.slice((page - 1) * perPage, page * perPage);
    const msg = pageList.map(name => `• ${name}`).join("\n");

    return sendImage(
      `📖 Page ${page}/${pageCount}\n\n${msg}\n\n🔍 Use: ${prefix}help [command name]`
    );
  }

  // ✅ Specific command info
  const cmdName = (args[0] || "").toLowerCase();
  if (!cmdName) {
    return api.sendMessage(`ℹ️ Use: ${prefix}help [name | all | page]`, threadID, messageID);
  }

  const command = commands.get(cmdName);
  if (!command) {
    return api.sendMessage(`❌ Command not found: ${cmdName}`, threadID, messageID);
  }

  const info = getText(
    "moduleInfo",
    command.config.name,
    command.config.description,
    `${prefix}${command.config.name} ${(command.config.usages || "")}`,
    command.config.commandCategory,
    command.config.cooldowns,
    command.config.hasPermssion == 0
      ? getText("user")
      : command.config.hasPermssion == 1
      ? getText("adminGroup")
      : getText("adminBot"),
    command.config.credits
  );

  return sendImage(info);
};