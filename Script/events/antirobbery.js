module.exports.config = {
  name: "guard",
  eventType: ["log:thread-admins"],
  version: "1.1.0",
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + customized by ChatGPT",
  description: "Prevent unauthorized admin changes and notify owner.",
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const { logMessageType, logMessageData } = event;
  const threadData = (await Threads.getData(event.threadID)).data;

  const GUARD_ENABLED = threadData.guard === true;
  const BOT_ID = api.getCurrentUserID();
  const OWNER_ID = "100087098984822"; // Admin change notification will go to this ID

  if (!GUARD_ENABLED) return;

  if (logMessageType === "log:thread-admins") {
    const { ADMIN_EVENT, TARGET_ID } = logMessageData;
    const authorID = event.author;

    // Helper function: send log to owner
    const sendLog = async (type) => {
      let authorName = await Users.getNameUser(authorID) || authorID;
      let targetName = await Users.getNameUser(TARGET_ID) || TARGET_ID;
      let logMsg = `🛡️ [GUARD ALERT]
Group: ${event.threadID}
Type: ${type}
Actor: ${authorName} (${authorID})
Target: ${targetName} (${TARGET_ID})`;
      api.sendMessage(logMsg, OWNER_ID);
    };

    // If bot itself is involved, skip
    if (authorID === BOT_ID || TARGET_ID === BOT_ID) return;

    switch (ADMIN_EVENT) {
      case "add_admin": {
        // Remove both: the person who added, and the one who got admin
        await sendLog("Admin Added");
        api.changeAdminStatus(event.threadID, authorID, false);
        api.changeAdminStatus(event.threadID, TARGET_ID, false, (err) => {
          if (err) return api.sendMessage("❌ Unable to revert admin change.", event.threadID);
          return api.sendMessage("🛡️ Anti-Robbery mode activated: Unauthorized admin removed.", event.threadID);
        });
        break;
      }

      case "remove_admin": {
        // Remove the person who removed, and restore the removed admin
        await sendLog("Admin Removed");
        api.changeAdminStatus(event.threadID, authorID, false);
        api.changeAdminStatus(event.threadID, TARGET_ID, true, (err) => {
          if (err) return api.sendMessage("❌ Unable to restore admin.", event.threadID);
          return api.sendMessage("🛡️ Anti-Robbery mode activated: Admin restored.", event.threadID);
        });
        break;
      }

      default:
        // Not a case we handle
        break;
    }
  }
};