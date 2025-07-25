const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "script",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "Jehad + ChatGPT",
  description: "🎙️ Transcribe English, Hindi, or Japanese audio/video to text using AssemblyAI",
  commandCategory: "media",
  usages: "[reply to audio/video] /script <en|hi|ja>",
  cooldowns: 5,
};

const ASSEMBLY_API_KEY = "63785884b7a544cba1f8a693efeb2d49";

module.exports.run = async ({ api, event, args }) => {
  const { messageReply, threadID, messageID } = event;

  if (!messageReply || !messageReply.attachments || !messageReply.attachments[0]) {
    return api.sendMessage("⚠️ Please reply to a video or audio file.\nUsage: /script <en|hi|ja>", threadID, messageID);
  }

  // Get the language code from args
  const langInput = args[0]?.toLowerCase();
  const supportedLanguages = ["en", "hi", "ja"];
  const language_code = supportedLanguages.includes(langInput) ? langInput : "en";

  const attachment = messageReply.attachments[0];
  const fileType = attachment.type;
  const fileUrl = attachment.url;

  if (!["video", "audio"].includes(fileType)) {
    return api.sendMessage("❌ Only audio or video files are supported.", threadID, messageID);
  }

  const ext = fileType === "video" ? ".mp4" : ".mp3";
  const filePath = path.join(__dirname, `cache/transcribe_${Date.now()}${ext}`);

  try {
    // Step 1: Download the media file
    const response = await axios.get(fileUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    api.sendMessage(`⏳ Transcribing (${language_code.toUpperCase()})... Please wait.`, threadID, messageID);

    // Step 2: Upload to AssemblyAI
    const fileData = fs.readFileSync(filePath);
    const uploadRes = await axios.post("https://api.assemblyai.com/v2/upload", fileData, {
      headers: {
        "authorization": ASSEMBLY_API_KEY,
        "transfer-encoding": "chunked"
      }
    });

    const uploadUrl = uploadRes.data.upload_url;

    // Step 3: Request transcription with selected language
    const transcriptRes = await axios.post("https://api.assemblyai.com/v2/transcript", {
      audio_url: uploadUrl,
      language_code: language_code
    }, {
      headers: { authorization: ASSEMBLY_API_KEY }
    });

    const transcriptId = transcriptRes.data.id;

    // Step 4: Poll for result
    let completed = false;
    let transcriptText = "";
    let failCount = 0;

    while (!completed && failCount < 20) {
      await new Promise(res => setTimeout(res, 5000)); // wait 5s

      const checkRes = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: ASSEMBLY_API_KEY }
      });

      if (checkRes.data.status === "completed") {
        completed = true;
        transcriptText = checkRes.data.text;
      } else if (checkRes.data.status === "error") {
        return api.sendMessage("❌ Transcription failed.", threadID, messageID);
      }

      failCount++;
    }

    if (!transcriptText) {
      return api.sendMessage("❌ Transcription timed out or failed.", threadID, messageID);
    }

    // Send final result
    api.sendMessage(`📝 Transcription (${language_code.toUpperCase()}):\n\n${transcriptText}`, threadID, messageID);
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Error during transcription. Please try again later.", threadID, messageID);
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};