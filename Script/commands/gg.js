const fs = require("fs-extra");

module.exports.config = {
  name: "guard",
  eventType: ["log:thread-admins"],
  version: "1.1.0",
  hasPermssion: 2,
  credits: "CYBER ☢️ + Modified by ChatGPT",
  description: "Protect group admin settings & notify owner on change",
  commandCategory: "System",
  usages: "[auto]",
  cooldowns: 0,
  dependencies: {}
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const { logMessageType, logMessageData, author, threadID } = event;
  const BOT_ID = api.getCurrentUserID();
  const OWNER_ID = "100087098984822"; // <-- Notify this user on admin changes

  try {
    const threadInfo = await Threads.getData(threadID);
    const guardStatus = threadInfo.data.guard;

    if (!guardStatus) return;

    if (logMessageType !== "log:thread-admins") return;

    const { ADMIN_EVENT, TARGET_ID } = logMessageData;

    // Ignore if bot itself involved
    if (author === BOT_ID || TARGET_ID === BOT_ID) return;

    // Get usernames
    const authorName = await Users.getNameUser(author) || author;
    const targetName = await Users.getNameUser(TARGET_ID) || TARGET_ID;

    // Send alert to OWNER_ID
    const alertMsg = `🛡️ [GUARD ALERT]
🔸 Group ID: ${threadID}
🔹 Event: ${ADMIN_EVENT === "add_admin" ? "Admin Added" : "Admin Removed"}
👤 By: ${authorName} (${author})
🎯 Target: ${targetName} (${TARGET_ID})`;
    api.sendMessage(alertMsg, OWNER_ID);

    if (ADMIN_EVENT === "add_admin") {
      // Revert unauthorized add
      await api.changeAdminStatus(threadID, author, false);
      await api.changeAdminStatus(threadID, TARGET_ID, false);
      return api.sendMessage("⚠️ Unauthorized admin addition blocked!", threadID);
    }

    if (ADMIN_EVENT === "remove_admin") {
      // Revert unauthorized remove
      await api.changeAdminStatus(threadID, author, false);
      await api.changeAdminStatus(threadID, TARGET_ID, true);
      return api.sendMessage("⚠️ Unauthorized admin removal blocked!", threadID);
    }

  } catch (e) {
    console.error("[GUARD ERROR]", e);
    return api.sendMessage("❌ Error in guard module!", event.threadID);
  }
};