module.exports.config = {
  name: "okfsfs",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "John Lester",
  description: "Just Respond",
  commandCategory: "no prefix",
  cooldowns: 5
};

module.exports.handleEvent = function({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const msg = body.toLowerCase();
  if (
    msg.includes("fork") ||
    msg.includes("bot link") ||
    msg.includes("fork link") ||
    msg.includes("link fork") ||
    msg.includes("fork link daow") ||
    msg.includes("ullash fork link") ||
    msg.includes("repository") ||
    msg.includes("cyber bot fork") ||
    msg.includes("bot fork link") ||
    msg.includes("need fork") ||
    msg.includes("kaow akta fork link daow") ||
    msg.includes("ullash fork") ||
    msg.includes("bot fork")
  ) {
    api.sendMessage({ body: "Inbox admin for get bot file." }, threadID, messageID);
    api.setMessageReaction('☢️', messageID, threadID, () => {}, true);
  }
};

module.exports.run = function({ api, event }) {
  // no run logic
};