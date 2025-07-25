const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
config: {
name: "music",
version: "2.1.0",
hasPermssion: 0,
credits: "dipto (converted for Maira by ChatGPT)",
description: "Download and play YouTube audio from name or link",
commandCategory: "media",
usages: "[song name or YouTube link]",
cooldowns: 5,
},

run: async function ({ api, event, args }) {
const { threadID, messageID } = event;

if (!args[0]) {  
  return api.sendMessage("❌ Please provide a song name or YouTube link.", threadID, messageID);  
}  

const input = args.join(" ");  
const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/))([\w-]{11})/;  
const isYTLink = ytRegex.test(input);  

const baseApiUrl = async () => {  
  const res = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");  
  return res.data.api;  
};  

const dipto = async (url, filePath) => {  
  const res = await axios.get(url, { responseType: "arraybuffer" });  
  fs.writeFileSync(filePath, Buffer.from(res.data));  
  return fs.createReadStream(filePath);  
};  

const cacheDir = path.join(__dirname, "cache");  
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });  

const wait = await api.sendMessage("🔄 Fetching your song, please wait...", threadID);  

try {  
  const apiUrl = await baseApiUrl();  
  let videoID;  

  if (isYTLink) {  
    const match = input.match(ytRegex);  
    videoID = match[1];  
  } else {  
    const search = (await axios.get(`${apiUrl}/ytFullSearch?songName=${encodeURIComponent(input)}`)).data;  
    if (!search.length) throw new Error("❌ No song found with that keyword.");  
    videoID = search[0].id;  
  }  

  const { data } = await axios.get(`${apiUrl}/ytDl3?link=${videoID}&format=mp3`);  
  const { title, downloadLink, quality } = data;  

  const fileName = `audio-${Date.now()}.mp3`;  
  const filePath = path.join(cacheDir, fileName);  
  const audioStream = await dipto(downloadLink, filePath);  

  await api.sendMessage(  
    {  
      body: `🎧 Now Playing:\n${title}\n🎵 Quality: ${quality || "Unknown"}`,  
      attachment: audioStream,  
    },  
    threadID,  
    () => {  
      fs.unlinkSync(filePath);  
      api.unsendMessage(wait.messageID);  
    },  
    messageID  
  );  
} catch (err) {  
  console.error("MUSIC CMD ERROR:", err.message);  
  api.sendMessage("❌ Failed to process the song. Please try again.", threadID, messageID);  
}

},
};