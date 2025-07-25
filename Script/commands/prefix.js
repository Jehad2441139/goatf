const fs = require('fs');
const request = require('request');
const moment = require('moment-timezone');

module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ullash",
  description: "send bot prefix",
  commandCategory: "prefix",
  usages: '',
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;

  if (!body || body.trim().toLowerCase() !== "prefix") return;

  const startTime = Date.now();

  let day = moment.tz("Asia/Ho_Chi_Minh").format("dddd");
  const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");

  const fancyDays = {
    Sunday: "𝚂𝚞𝚗𝚍𝚊𝚢",
    Monday: "𝙼𝚘𝚗𝚍𝚊𝚢",
    Tuesday: "𝚃𝚞𝚎𝚜𝚍𝚊𝚢",
    Wednesday: "𝚆𝚎𝚍𝚗𝚎𝚜𝚍𝚊𝚢",
    Thursday: "𝚃𝚑𝚞𝚛𝚜𝚍𝚊𝚢",
    Friday: "𝙵𝚛𝚒𝚍𝚊𝚢",
    Saturday: "𝚂𝚊𝚝𝚞𝚛𝚍𝚊𝚢"
  };
  day = fancyDays[day] || day;

  const { PREFIX, BOTNAME } = global.config;
  const threadPrefix = (global.data.threadData.get(threadID) || {}).PREFIX || PREFIX;
  const commandCount = global.client?.commands?.size || "N/A";

  const imageLinks = [
    "https://i.imgur.com/UnTsdhO.jpeg",
    "https://i.imgur.com/8tNmUVM.jpeg",
    "https://i.imgur.com/ksuAxtx.jpeg",
    "https://i.imgur.com/1TqMV65.jpeg",
    "https://i.postimg.cc/15kmn8tP/images-15.jpg"
  ];
  const imageUrl = imageLinks[Math.floor(Math.random() * imageLinks.length)];
  const imagePath = __dirname + "/prefix.jpg";

  request(imageUrl).pipe(fs.createWriteStream(imagePath)).on("close", () => {
    api.sendMessage({
      body:
        `╔══════𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢══════╗\n\n` +
        `┃ 𝗝𝗼𝘆 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁 | 𝗝𝗼𝘆\n` +
        `┃━━━━━━━━━━━━━━━━━━━━\n` +
        `┃ ✿ 𝗚𝗿𝗼𝘂𝗽 𝗣𝗿𝗲𝗳𝗶𝘅: ${threadPrefix}\n` +
        `┃ ۞ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗣𝗿𝗲𝗳𝗶𝘅: ${PREFIX}\n` +
        `┃ ✪ 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${BOTNAME}\n` +
        `┃ ❁ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${commandCount}\n` +
        `┃ ✴ 𝗣𝗶𝗻𝗴: ${Date.now() - startTime}ms\n` +
        `┃━━━━━━━━━━━━━━━━━━━━\n` +
        `┃ 🗓️ ${day} | ⏰ ${dateTime}\n` +
        `╚════════════════════╝`,
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlinkSync(imagePath), messageID);
  }).on("error", err => {
    console.error("Image download error:", err);
    api.sendMessage("⚠️ Could not fetch image. Please try again later.", threadID, messageID);
  });
};

module.exports.run = async () => {};