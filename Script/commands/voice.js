const axios = require("axios");
const fs = require("fs");
const request = require("request");

const emojiAudioMap = {
  "🥺": {
    url: "https://drive.google.com/uc?export=download&id=1Gyi-zGUv5Yctk5eJRYcqMD2sbgrS_c1R",
    caption: "মিস ইউ বেপি...🥺"
  },
  "😍": {
    url: "https://drive.google.com/uc?export=download&id=1lIsUIvmH1GFnI-Uz-2WSy8-5u69yQ0By",
    caption: "তোমার প্রতি ভালোবাসা দিনকে দিন বাড়ছে... 😍"
  },
  "😭": {
    url: "https://drive.google.com/uc?export=download&id=1qU27pXIm5MV1uTyJVEVslrfLP4odHwsa",
    caption: "জান তুমি কান্না করতেছো কোনো... 😭"
  },
  "😡": {
    url: "https://drive.google.com/uc?export=download&id=1S_I7b3_f4Eb8znzm10vWn99Y7XHaSPYa",
    caption: "রাগ কমাও, মাফ করাই বড়ত্ব... 😡"
  },
  "🙄": {
    url: "https://drive.google.com/uc?export=download&id=1gtovrHXVmQHyhK2I9F8d2Xbu7nKAa5GD",
    caption: "এভাবে তাকিও না তুমি ভেবে লজ্জা লাগে ... 🙄"
  },
  "😑": {
    url: "https://drive.google.com/uc?export=download&id=1azElOD2QeaMbV2OdCY_W3tErD8JQ3T7P",
    caption: "লেবু খাও জান সব ঠিক হয়ে যাবে 😑"
  },
  "😒": {
    url: "https://drive.google.com/uc?export=download&id=1tbKe8yiU0RbINPlQgOwnig7KPXPDzjXv",
    caption: "বিরক্ত করো না জান... ❤️"
  },
  "🤣": {
    url: "https://drive.google.com/uc?export=download&id=1Hvy_Xee8dAYp-Nul7iZtAq-xQt6-rNpU",
    caption: "হাসলে তোমাকে পাগল এর মতো লাগে... 🤣"
  },
  "💔": {
    url: "https://drive.google.com/uc?export=download&id=1jQDnFc5MyxRFg_7PsZXCVJisIIqTI8ZY",
    caption: "feel this song... 💔"
  },
  "🙂": {
    url: "https://drive.google.com/uc?export=download&id=1_sehHc-sDtzuqyB2kL_XGMuvm2Bv-Dqc",
    caption: "তুমি কি আধো আমাকে ভালোবাসো ... 🙂"
  },
  "🤤": {
    url: "https://scontent.xx.fbcdn.net/v/t42.3356-2/496530447_9675625132557740_5096289856394930414_n.mp4?_nc_cat=106&ccb=1-7&_nc_sid=4f86bc&_nc_eui2=AeHo_XDAf53Nw2qxX7ctoA5FpoP5iqsztJimg_mKqzO0mMCSQlwcWy8U1GD4yECRtozBd1Qne9KRrngTupj9bkXN&_nc_ohc=sZkc8UaXLTwQ7kNvwHXbiLt&_nc_oc=AdnAp26Spq9R9vEyR6VUU8viUOUTh-e3FnH-9Qw9hUCKTliLrBkG95x5SS4gJNC1D24&_nc_zt=28&_nc_ht=scontent.xx&_nc_gid=dnGI5Mak9PFs_WCGYClTFA&oh=03_Q7cD2wGukBaCUeIyQkiVnkBcsM9WnUngvvVpTJF0EFPURFSJUA&oe=6886E6F1&dl=1",
    caption: "তোমার লাজুক মুখখানা আজও মনে পড়ে... 🤤"
  },
  "😔": {
    url: "https://cdn.fbsbx.com/v/t59.3654-21/512841245_1810679399480826_6322210213023389806_n.mp4/audioclip-1753550218000-10300.mp4?_nc_cat=100&ccb=1-7&_nc_sid=d61c36&_nc_eui2=AeEg5mEmIpYqUywTgp5Du3orNEjRv6ob_ww0SNG_qhv_DIB45kO3eKGTE9FVgYOKexzQhSQpmKUoLCQ4CQPXD03Q&_nc_ohc=5bxqDB-jxOoQ7kNvwGGRvNX&_nc_oc=AdmQ3idldA2keXy7q1QmNMuEbrMDxixhyH8DDkJa4dqJHEs-lVCn7_uDbZP_LBt81Y0&_nc_zt=28&_nc_ht=cdn.fbsbx.com&_nc_gid=aJTIk2r-xoqUW3KPrYOH8A&oh=03_Q7cD2wHNPgazqh1au59FHSQqJj_JCd1HfiWq3oBLlPZY-qNQbg&oe=6886EBB1&dl=1",
    caption: "Chomri... মাফ করো 😔"
  },
  "sorry": {
    url: "https://cdn.fbsbx.com/v/t59.3654-21/512841245_1810679399480826_6322210213023389806_n.mp4/audioclip-1753550218000-10300.mp4?_nc_cat=100&ccb=1-7&_nc_sid=d61c36&_nc_eui2=AeEg5mEmIpYqUywTgp5Du3orNEjRv6ob_ww0SNG_qhv_DIB45kO3eKGTE9FVgYOKexzQhSQpmKUoLCQ4CQPXD03Q&_nc_ohc=5bxqDB-jxOoQ7kNvwGGRvNX&_nc_oc=AdmQ3idldA2keXy7q1QmNMuEbrMDxixhyH8DDkJa4dqJHEs-lVCn7_uDbZP_LBt81Y0&_nc_zt=28&_nc_ht=cdn.fbsbx.com&_nc_gid=aJTIk2r-xoqUW3KPrYOH8A&oh=03_Q7cD2wHNPgazqh1au59FHSQqJj_JCd1HfiWq3oBLlPZY-qNQbg&oe=6886EBB1&dl=1",
    caption: "সরি বললেই কি সব সমস্যা মিটে যায় জান...? 😔"
  }
};

module.exports.config = {
  name: "emoji_voice",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Islamick Chat Modified by Cyber-Sujon + ChatGPT",
  description: "Emoji অথবা 'sorry' লিখলেই ভয়েস রেসপন্স",
  commandCategory: "noprefix",
  usages: "🥺 😔 sorry",
  cooldowns: 3
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const emoji = body.trim().toLowerCase();
  const audioData = emojiAudioMap[emoji];

  if (!audioData) return;

  const filePath = `${__dirname}/cache/${encodeURIComponent(emoji)}.mp3`;

  const callback = () => {
    api.sendMessage({
      body: `╭•┄┅════❁🌺❁════┅┄•╮\n\n${audioData.caption}\n\n╰•┄┅════❁🌺❁════┅┄•╯`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath), messageID);
  };

  const stream = request(encodeURI(audioData.url));
  stream.pipe(fs.createWriteStream(filePath)).on("close", callback);
};

module.exports.run = () => {};
