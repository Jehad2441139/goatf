const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "rule34",
  aliases: ["r34", "r34vid"],
  version: "1.0",
  credits: "ChatGPT & Jehad Joy",
  description: "Rule34 থেকে mp4 বা webm ভিডিও ডাউনলোড করে Messenger এ পাঠাবে",
  commandCategory: "18+",
  usages: "{pn} [ট্যাগ]",
  cooldown: 30,
  hasPermssion: 0,
};

module.exports.run = async ({ api, event, args }) => {
  const tag = args.length > 0 ? args.join(" ") : "hentai";
  const filePath = path.join(__dirname, "cache", "6767.mp4");

  try {
    // Step 1: Rule34 API থেকে ভিডিও ডেটা আনা
    const response = await axios.get(`https://api.rule34.xxx/index.php`, {
      params: {
        page: "dapi",
        s: "post",
        q: "index",
        tags: tag,
        limit: 100,
        json: 1,
      },
    });

    const posts = response.data;
    if (!posts || posts.length === 0)
      return api.sendMessage(`❌ "${tag}" ট্যাগে কোনো ভিডিও পাওয়া যায়নি।`, event.threadID);

    // Step 2: mp4 বা webm ফাইল filter করা
    const videos = posts.filter(
      (p) =>
        p.file_url &&
        (p.file_url.endsWith(".mp4") || p.file_url.endsWith(".webm"))
    );

    if (videos.length === 0)
      return api.sendMessage(`❌ "${tag}" ট্যাগে ভিডিও পাওয়া যায়নি।`, event.threadID);

    // Step 3: র‍্যান্ডম ভিডিও সিলেক্ট
    const selected = videos[Math.floor(Math.random() * videos.length)];

    // Step 4: ভিডিও ডাউনলোড
    const videoRes = await axios.get(selected.file_url, {
      responseType: "arraybuffer",
    });

    fs.writeFileSync(filePath, Buffer.from(videoRes.data));

    // Step 5: ফাইল সাইজ চেক (Messenger max ~25MB)
    const sizeMB = fs.statSync(filePath).size / (1024 * 1024);
    if (sizeMB > 25) {
      fs.unlinkSync(filePath);
      return api.sendMessage("❌ ভিডিও ২৫MB এর বেশি, পাঠানো সম্ভব নয়।", event.threadID);
    }

    // Step 6: Messenger এ ভিডিও পাঠানো
    return api.sendMessage(
      {
        body: `🔞 Rule34 ভিডিও: ${tag}`,
        attachment: fs.createReadStream(filePath),
      },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ ভিডিও আনতে সমস্যা হয়েছে।", event.threadID);
  }
};