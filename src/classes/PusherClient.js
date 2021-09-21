const log = require("electron-log");
const { authHeader } = require("../utils/auth");
const Pusher = require("pusher-js");

const pusher = async () => {
  const token = await authHeader();
  return new Pusher("8ff0572d6882103f1606", {
    cluster: "ap1",
    authEndpoint: "https://app.chatbothotels.com/api/auth/private-channel",
    auth: {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: token,
      },
    },
  });
};

module.exports = { pusher };
