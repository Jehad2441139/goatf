 const { Chess } = require('chess.js');
const { ChessImageGenerator } = require('chess-image-generator');
const fs = require('fs-extra');
const path = require('path');

const sessions = {};

module.exports = {
  config: {
    name: "chess",
    version: "3.0",
    hasPermssion: 0,
    credits: "Jehad Joy x ChatGPT",
    description: "চেস গেম খেলুন বোর্ড ইমেজ সহ (লোকাল)",
    commandCategory: "game",
    usages: "",
    cooldowns: 5
  },

  run: async function({ api, event }) {
    const { threadID, senderID } = event;
    const game = new Chess();
    sessions[senderID] = game;

    game.move("d4"); // AI starts

    const cachePath = path.join(__dirname, "cache");
    await fs.ensureDir(cachePath);

    const imagePath = path.join(cachePath, `chess-${senderID}.png`);
    const image = new ChessImageGenerator();
    image.loadFEN(game.fen());
    await image.generatePNG(imagePath);

    api.sendMessage({
      body: "♟️ চেস গেম শুরু!\n🤖 Felix চাললো: d4\n✏️ এখন তুমি চাল দাও (যেমন: e7 e5)",
      attachment: fs.createReadStream(imagePath)
    }, threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID
        });
      }
    });
  },

  handleReply: async function({ api, event, handleReply }) {
    const { threadID, senderID, body } = event;
    if (handleReply.author !== senderID)
      return api.sendMessage("❌ তুমি এই গেমের খেলোয়াড় না!", threadID);

    const game = sessions[senderID];
    if (!game || game.game_over())
      return api.sendMessage("⚠️ গেম শেষ হয়েছে। `/chess` দিয়ে নতুন করে শুরু করো।", threadID);

    const [from, to] = body.trim().split(" ");
    const move = game.move({ from, to });

    if (!move)
      return api.sendMessage("🚫 অবৈধ চাল! আবার দাও (যেমন: e7 e5)", threadID);

    // AI move
    if (!game.game_over()) {
      const aiMove = game.moves()[Math.floor(Math.random() * game.moves().length)];
      game.move(aiMove);
    }

    const cachePath = path.join(__dirname, "cache");
    const imagePath = path.join(cachePath, `chess-${senderID}.png`);
    const image = new ChessImageGenerator();
    image.loadFEN(game.fen());
    await image.generatePNG(imagePath);

    const reply = game.game_over()
      ? "🏁 গেম শেষ! `/chess` দিয়ে আবার শুরু করো।"
      : `✅ চাল: ${from} → ${to}\n🤖 Felix চাল দিল!\n✏️ পরবর্তী চাল দিন।`;

    api.sendMessage({
      body: reply,
      attachment: fs.createReadStream(imagePath)
    }, threadID, (err, info) => {
      if (!game.game_over()) {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID
        });
      } else {
        delete sessions[senderID];
        fs.unlink(imagePath);
      }
    });
  }
};