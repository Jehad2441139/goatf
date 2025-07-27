module.exports.config = {
  name: "join",
  eventType: ['log:subscribe'],
  version: "1.0.1",
  credits: "Jehad Joy Edit by ChatGPT",
  description: "নতুন মেম্বার এলে ওয়েলকাম ইমেজ সহ বার্তা"
};

const ADMIN = 'Jehad Joy';
const FB_LINK = 'https://facebook.com/jehad.joy.fb';

const fs = require('fs-extra');
const axios = require('axios');
const { loadImage, createCanvas, registerFont } = require('canvas');
const jimp = require("jimp");
const moment = require("moment-timezone");

const FONT_LINK = 'https://drive.google.com/u/0/uc?id=1ZwFqYB-x6S9MjPfYm3t3SP1joohGl4iw&export=download';

module.exports.circle = async (image) => {
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function({ api, event, Users }) {
  const threadID = event.threadID;
  const { logMessageData } = event;

  const time = moment.tz("Asia/Dhaka").format("hh:mm A - DD MMMM YYYY");
  const session = moment().tz("Asia/Dhaka").format("A") === "AM" ? "সকাল" : "বিকেল";
  const day = moment().tz("Asia/Dhaka").format("dddd");

  const threadInfo = await api.getThreadInfo(threadID);
  const threadName = threadInfo.threadName;
  const participantIDs = threadInfo.participantIDs;

  // যদি বট নিজে এড হয়
  if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    let gifUrl = 'https://i.imgur.com/4HMupHz.gif';
    let gifPath = __dirname + '/cache/join.gif';

    let res = await axios.get(gifUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(gifPath, res.data);

    return api.sendMessage({
      body: `🤖 হ্যালো! আমি সফলভাবে ${threadName} গ্রুপে যুক্ত হয়েছি ✅

🔹 সময়: ${time}
🔹 কমান্ড সংখ্যা: ${global.client.commands.size}
🔹 Prefix: ${global.config.PREFIX}
🔹 এডমিন: ${ADMIN}
🔹 Facebook: ${FB_LINK}
🔹 কমান্ড দেখতে লিখুন: ${global.config.PREFIX}help`,
      attachment: fs.createReadStream(gifPath)
    }, threadID);
  }

  // New user join হলে
  try {
    if (!fs.existsSync(__dirname + `/cache/font/Semi.ttf`)) {
      let fontBuffer = (await axios.get(FONT_LINK, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(__dirname + `/cache/font/Semi.ttf`, fontBuffer);
    }

    registerFont(__dirname + `/cache/font/Semi.ttf`, { family: "Semi" });

    let attachments = [];
    let mentions = [];
    let nameArray = [];

    for (let i = 0; i < logMessageData.addedParticipants.length; i++) {
      let user = logMessageData.addedParticipants[i];
      let name = user.fullName;
      let id = user.userFbId;

      nameArray.push(name);
      mentions.push({ tag: name, id });

      // Avatar
      let avatarURL = `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      let avatarData = (await axios.get(avatarURL, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(__dirname + `/cache/avt.png`, avatarData);
      let avatarCircle = await this.circle(__dirname + `/cache/avt.png`);

      // Background
      const backgrounds = [
        'https://i.imgur.com/dDSh0wc.jpeg',
        'https://i.imgur.com/UucSRWJ.jpeg',
        'https://i.imgur.com/OYzHKNE.jpeg'
      ];
      let bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      let bgData = (await axios.get(bgURL, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(__dirname + `/cache/bg.png`, bgData);

      let baseImage = await loadImage(__dirname + `/cache/bg.png`);
      let baseAvatar = await loadImage(avatarCircle);
      let canvas = createCanvas(1902, 1082);
      let ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseAvatar, canvas.width / 2 - 188, canvas.height / 2 - 375, 375, 355);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = `90px Semi`;
      ctx.fillText(name, canvas.width / 2, canvas.height / 2 + 100);

      ctx.font = `65px Semi`;
      ctx.fillText(`🌺 স্বাগতম ${threadName} গ্রুপে!`, canvas.width / 2, canvas.height / 2 + 200);
      ctx.fillText(`🔥 এখন আমাদের সদস্য সংখ্যা ${participantIDs.length} জন`, canvas.width / 2, canvas.height / 2 + 300);

      let buffer = canvas.toBuffer();
      let imgPath = __dirname + `/cache/welcome_${i}.png`;
      fs.writeFileSync(imgPath, buffer);
      attachments.push(fs.createReadStream(imgPath));
    }

    // Welcome message
    const nameAuthor = await Users.getNameUser(event.author);
    let message = `🌸 হ্যালো ${nameArray.join(', ')}!\n\nস্বাগতম ${threadName} গ্রুপে 🥰

➤ তোমাকে অ্যাড করেছেন: ${nameAuthor}
➤ যোগদানের সময়: ${time} (${day}, ${session})

গ্রুপে সক্রিয় থাকতে ভুলো না 😄`;

    await api.sendMessage({ body: message, attachment: attachments, mentions }, threadID);

    // Cleanup
    fs.unlinkSync(__dirname + `/cache/avt.png`);
    fs.unlinkSync(__dirname + `/cache/bg.png`);
    for (let i = 0; i < logMessageData.addedParticipants.length; i++) {
      fs.unlinkSync(__dirname + `/cache/welcome_${i}.png`);
    }
  } catch (e) {
    console.error("JOIN MODULE ERROR:", e);
  }
};
