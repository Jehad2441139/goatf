const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
  name: "admin",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Joy",
  description: "Show Owner Info",
  commandCategory: "info",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");
  const sendInfo = () => api.sendMessage({
    body:
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃      🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🌟      
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐍𝐚𝐦𝐞      : Joy
┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫    : Male
┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧  : Single
┃ 🎂 𝐀𝐠𝐞       : 17
┃ 🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧  : Islam
┃ 🏫 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 : Inter 2nd Year
┃ ☎️ 𝐂𝐨𝐧𝐭𝐚𝐜𝐭   : 01959135627
┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬  : Jhenaidah, Bangladesh
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🎭 𝐓𝐢𝐤𝐓𝐨𝐤   : Protibondhi app rakhi na
┃ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : https://www.facebook.com/king.is.back.take.love.all
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 𝐔𝐩𝐝𝐚𝐭𝐞𝐝 𝐓𝐢𝐦𝐞:  ${time}
┗━━━━━━━━━━━━━━━━━━━━━┛`,
    attachment: fs.createReadStream(__dirname + "/cache/1.png")
  }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"));

  // Profile pic (you can replace the UID if you want to use your own)
  return request(encodeURI("https://graph.facebook.com/100087098984822/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"))
    .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
    .on("close", () => sendInfo());
};
