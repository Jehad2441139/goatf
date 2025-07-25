const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "chattheme",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Jehad Joy x ChatGPT",
  description: "Generate a fake messenger chat theme preview image",
  commandCategory: "fun",
  usages: "[theme name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const theme = args.join(" ").trim();
  if (!theme) return api.sendMessage("📌 একটি থিমের নাম দিন। উদাহরণ: /chattheme Rainbow", event.threadID, event.messageID);

  const canvas = createCanvas(600, 350);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Messenger-style chat bubbles
  ctx.fillStyle = "#0084FF";
  drawRoundRect(ctx, 50, 100, 320, 50, 20); // user message

  ctx.fillStyle = "#F1F0F0";
  drawRoundRect(ctx, 120, 180, 320, 50, 20); // other message

  // Theme preview header
  ctx.fillStyle = "#E3E3E3";
  ctx.fillRect(0, 0, canvas.width, 60);
  ctx.fillStyle = "#333";
  ctx.font = "bold 24px Arial";
  ctx.fillText(`📱 Chat Theme: ${theme}`, 20, 40);

  // Footer
  ctx.fillStyle = "#999";
  ctx.font = "italic 16px Arial";
  ctx.fillText("Messenger Preview • Not Real", 180, 330);

  // Save image
  const imagePath = path.join(__dirname, "cache", `theme-${event.senderID}.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(imagePath, buffer);

  // Send image
  api.sendMessage({
    body: `✅ Meta AI-style থিম প্রিভিউ তৈরি হয়েছে!\n🎨 থিম: ${theme}`,
    attachment: fs.createReadStream(imagePath)
  }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
};

// 🟦 Draw rounded rectangle
function drawRoundRect(ctx, x, y, w, h, r, fill = true, stroke = false) {
  if (typeof r === "undefined") r = 5;
  if (typeof r === "number") {
    r = { tl: r, tr: r, br: r, bl: r };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) {
      r[side] = r[side] || defaultRadius[side];
    }
  }

  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}