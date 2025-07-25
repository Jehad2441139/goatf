const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

// Proxy Setup
const proxy = "http://108.162.192.12:80";
const proxyAgent = new HttpsProxyAgent(proxy);

// Base API
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "spy",
    version: "2.4",
    hasPermission: 0,
    usePrefix: true,
    credits: "Dipto + ChatGPT",
    description: "Get FB user info using proxy",
    commandCategory: "information",
    cooldowns: 10,
  },

  run: async function ({ event, api, args }) {
    try {
      const senderID = event.senderID;
      const mentionID = Object.keys(event.mentions || {})[0];
      let uid;

      if (args[0]) {
        if (/^\d+$/.test(args[0])) uid = args[0];
        else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) uid = match[1];
        }
      }

      if (!uid) {
        uid =
          event.type === "message_reply"
            ? event.messageReply.senderID
            : mentionID || senderID;
      }

      const userInfo = await api.getUserInfo(uid);
      const user = userInfo[uid];
      if (!user) throw new Error("User info not found");

      const name = user.name || "Unknown";
      const firstName = name.split(" ")[0] || "";
      const secondName = name.split(" ")[1] || "";
      let genderText = "Unknown 🤷";

      // Gender detect
      try {
        const res = await axios.get(`https://api.genderize.io?name=${encodeURIComponent(firstName)}`, {
          httpsAgent: proxyAgent,
          timeout: 6000
        });
        let g = res.data.gender;
        let prob = parseFloat(res.data.probability) || 0;
        let count = res.data.count || 0;

        if (g && prob > 0.7 && count > 10) {
          genderText = g === "female" ? "Girl 🙋🏻‍♀️" : "Boy 🙋🏻‍♂️";
        } else if (secondName) {
          const res2 = await axios.get(`https://api.genderize.io?name=${encodeURIComponent(secondName)}`, {
            httpsAgent: proxyAgent,
            timeout: 6000
          });
          g = res2.data.gender;
          prob = parseFloat(res2.data.probability) || 0;
          count = res2.data.count || 0;

          if (g && prob > 0.7 && count > 10) {
            genderText = g === "female" ? "Girl 🙋🏻‍♀️" : "Boy 🙋🏻‍♂️";
          }
        }
      } catch (e) {
        console.warn("⚠️ Gender API failed:", e.message);
      }

      // Rank & money
      const userData = global.data.users?.[uid] || {};
      const allUsers = Object.keys(global.data.users || {}).map((id) => ({
        id,
        ...global.data.users[id],
      }));
      const money = userData.money || 0;
      const exp = userData.exp || 0;

      const rank =
        allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0)).findIndex((u) => u.id == uid) + 1;

      const moneyRank =
        allUsers.sort((a, b) => (b.money || 0) - (a.money || 0)).findIndex((u) => u.id == uid) + 1;

      // Baby Teach Count
      let babyTeach = 0;
      try {
        const response = await axios.get(`${await baseApiUrl()}/baby?list=all`, {
          httpsAgent: proxyAgent,
          timeout: 8000
        });
        const data = response.data || {};
        babyTeach = data?.teacher?.teacherList?.find((t) => t[uid])?.[uid] || 0;
      } catch (e) {
        console.log("⚠️ Baby API failed:", e.message);
      }

      // Avatar using access_token + proxy
      const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      let avatarStream;

      try {
        const response = await axios.get(avatarUrl, {
          responseType: "stream",
          httpsAgent: proxyAgent,
          timeout: 8000
        });
        avatarStream = response.data;
        console.log("✅ Avatar via proxy");
      } catch (err) {
        console.warn("⚠️ Proxy failed, trying direct:", err.message);
        const response = await axios.get(avatarUrl, {
          responseType: "stream",
          timeout: 8000
        });
        avatarStream = response.data;
        console.log("✅ Avatar direct fallback");
      }

      // Final message
      const info = `
☻︎━━━━━━━━━━━━━━☻︎
        𝙐𝙎𝙀𝙍 𝙄𝙉𝙁𝙊
☺︎︎━━━━━━━━━━━━━━㋛︎
👤 Name: ${name.toUpperCase()}
👤 UID: ${uid}
👤 Gender: ${genderText}
👤 Username: ${user.vanity || "None"}
👤 Profile: https://facebook.com/${user.vanity || "profile.php?id=" + uid}
👤 Nickname: ${user.alternateName || "None"}
👤 Birthday: ${user.isBirthday !== false ? user.isBirthday : "Private"}
👤 Bot Connected: ${user.isFriend ? "Yes ✅" : "No ❎"}
🍼 Baby Teach Count: ${babyTeach}
💰 Balance: ${money} | 💎 EXP: ${exp}
🏆 EXP Rank: ${rank} | 💵 Money Rank: ${moneyRank}
☻︎━━━━━━━━━━━━━━☻︎`;

      return api.sendMessage(
        { body: info, attachment: avatarStream },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error("❌ spy.js error:", err);
      return api.sendMessage(
        "❌ Spy command failed:\n" + err.message,
        event.threadID,
        event.messageID
      );
    }
  },
};