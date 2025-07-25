const axios = require("axios");

const fs = require("fs-extra");

const { HttpsProxyAgent } = require("https-proxy-agent");

const { alldown } = require("shaon-videos-downloader");

module.exports = {

  config: {

    name: "autodl",

    version: "0.1.3",

    hasPermssion: 0,

    credits: "SHAON + ChatGPT",

    description: "Auto video downloader with proxy",

    commandCategory: "user",

    usages: "",

    cooldowns: 5,

  },

  run: async function () {},

  handleEvent: async function ({ api, event }) {

    try {

      const content = event.body || '';

      const body = content.toLowerCase();

      if (!body.startsWith("https://")) return;

      api.setMessageReaction("🐥", event.messageID, () => {}, true);

      console.log("Link detected:", content);

      const data = await alldown(content);

      if (!data || !data.url) throw new Error("ভিডিও লিংক পাওয়া যায়নি!");

      const videoUrl = data.url;

      const proxyAgent = new HttpsProxyAgent("http://108.162.192.0:80");

      const res = await axios.get(videoUrl, {

        responseType: "arraybuffer",

        httpsAgent: proxyAgent,

        timeout: 15000

      });

      const filePath = __dirname + "/cache/auto.mp4";

      fs.writeFileSync(filePath, Buffer.from(res.data, "utf-8"));

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      return api.sendMessage({

        body: `ভিডিও ডাউনলোড সম্পন্ন ✅`,

        attachment: fs.createReadStream(filePath)

      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (err) {

      console.error("Autodl error:", err);

      return api.sendMessage("ভিডিও ডাউনলোডে সমস্যা:\n" + err.message, event.threadID, event.messageID);

    }

  }

};