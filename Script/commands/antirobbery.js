const fs = require("fs-extra");

module.exports.config = {
  name: "guard",
  eventType: ["log:thread-admins"],
  version: "1.1.0",
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + ChatGPT",
  description: "Prevent unauthorized admin changes and notify owner",
  dependencies: {}
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const { logMessageType, logMessageData } = event;
  const threadData = (await Threads.getData(event.threadID)).data;

  const GUARD_ENABLED = threadData.guard === true;
  const BOT_ID = api.getCurrentUserID();
  const OWNER_ID = "100087098984822"; // Your FB ID

  if (!GUARD_ENABLED) return;

  if (logMessageType === "log:thread-admins") {
    const { ADMIN_EVENT, TARGET_ID } = logMessageData;
    const authorID = event.author;

    // Skip if bot involved
    if (authorID === BOT_ID || TARGET_ID === BOT_ID) return;

    const sendLog = async (type) => {
      const authorName = await Users.getNameUser(authorID) || authorID;
      const targetName = await Users.getNameUser(TARGET_ID) || TARGET_ID;
      const message = `🛡️ [GUARD ALERT]
Group ID: ${event.threadID}
Type: ${type}
Actor: ${authorName} (${authorID})
Target: ${targetName} (${TARGET_ID})`;
      api.sendMessage(message, OWNER_ID);
    };

    if (ADMIN_EVENT === "add_admin") {
      await sendLog("Admin Added");
      api.changeAdminStatus(event.threadID, authorID, false);
      api.changeAdminStatus(event.threadID, TARGET_ID, false, (err) => {
        if (err) return api.sendMessage("❌ Can't revert admin.", event.threadID);
        return api.sendMessage("🛡️ Anti-Robbery activated: Admin removed.", event.threadID);
      });
    }

    else if (ADMIN_EVENT === "remove_admin") {
      await sendLog("Admin Removed");
      api.changeAdminStatus(event.threadID, authorID, false);
      api.changeAdminStatus(event.threadID, TARGET_ID, true, (err) => {
        if (err) return api.sendMessage("❌ Can't restore admin.", event.threadID);
        return api.sendMessage("🛡️ Anti-Robbery activated: Admin restored.", event.threadID);
      });
    }
  }
};