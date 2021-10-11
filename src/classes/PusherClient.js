const log = require("electron-log");
const { authHeader } = require("../utils/auth");
const Pusher = require("pusher-js");
const { openCheck } = require("./SymphonyClient");

const pusher = async () => {
  const token = await authHeader();
  log.info(token);
  const pusherClient = new Pusher("3d5685fdc9cec5b517dd", {
    cluster: "ap2",
    authEndpoint:
      "https://demo.dashboard.chatbothotels.com/api/auth/private-channel",
    auth: {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: token,
      },
    },
  });

  const channel = pusherClient.subscribe("private-pos");

  channel.bind("pusher:subscription_succeeded", function (status) {
    // Yipee!!
    log.info("Hello");
  });

  channel.bind("pusher:subscription_error", function (status) {
    log.error(status);
  });

  // channel.bind_global(function (eventName, data )  {
  //   log.info(eventName);
  //   openCheck(data);

  // });

  channel.bind("request.created", function (data) {
    log.info(data);
    openCheck(data);
  });
};

module.exports = { pusher };
