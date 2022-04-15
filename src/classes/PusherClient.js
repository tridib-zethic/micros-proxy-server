const log = require("electron-log");
const { authHeader, authRefreshToken } = require("../utils/auth");
const Pusher = require("pusher-js");
const { openCheck, getRevenueCentersRequest } = require("./SymphonyClient");
const {
  hotelDashboardURL,
  pusherCluster,
  pusherAppId,
} = require("../utils/constants");
const axios = require("axios");
const https = require("https");

Pusher.logToConsole = true;

let pusherClient = undefined;
let channel = undefined;
let token = authHeader();
let hotel = "https://fina.dashboard.guest-chat.com";
let hotelSlug = "fina";
let tempHotel = hotelDashboardURL();
if (tempHotel) {
  hotel = tempHotel;
  if (typeof hotel == "string") {
    hotelSlug = hotel.split(".")[0].split("//")[1];
  }
}

const autoLoginWithRefreshToken = async () => {
  const hotel = await hotelDashboardURL();
  const url = `${hotel}/api/v1`;
  const clientId = "1";
  const clientSecret = "MBr4dqsss0Qn4UcXLW3tTWYA5qk2IkevqhEwvDDj";

  let data = [];

  data["grant_type"] = "refresh_token";
  data["refresh_token"] = authRefreshToken();
  data["scope"] = "*";
  data["client_id"] = clientId;
  data["client_secret"] = clientSecret;

  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  instance
    .post(url + "/v1/oauth/token/refresh", data)
    .then(async function (response) {
      await keytar.setPassword(
        "login",
        "access_token",
        response.data.access_token
      );
      await keytar.setPassword(
        "login",
        "refresh_token",
        response.data.refresh_token
      );
      await keytar.setPassword(
        "login",
        "expires_in",
        response.data.expires_in.toString()
      );
      await pusher();
    })
    .catch(function (error) {
      log.error("PusherClient.js - line:69", error);
    });
};

const pusher = async (win = undefined, event = undefined) => {
  console.log("Pusher initialization");

  token = await authHeader();
  hotel = "https://fina.dashboard.guest-chat.com";
  hotelSlug = "fina";
  let requestIds = [];

  if (hotel) {
    // do nothing
  } else {
    hotel = "https://fina.dashboard.guest-chat.com";
  }
  hotelSlug = hotel.split(".")[0].split("//")[1];
  // log.info(token);

  const replyEventHandler = (status, message) => {
    if (win != undefined && event != undefined) {
      event.reply(status, message);
      if (status == "error") {
        win.show();
      }
      event.returnValue = true;
    }
  };

  const authorizer = (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        const data = new URLSearchParams();
        data.append("socket_id", socketId);
        data.append("channel_name", channel.name);

        const apiUri = `${hotel}/api/auth/private-channel`;

        const instance = axios.create({
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        });
        instance
          .post(apiUri, data, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-Requested-With": "XMLHttpRequest",
              Authorization: token,
            },
          })
          .then((res) => {
            log.info("Pusher Client Success");
            log.info("Success", res.data);
            replyEventHandler("success", "Login Successful!");
            callback(null, res.data);
          })
          .catch((err) => {
            log.error("PusherClient.js - line:125", error);
            if (err.response.status == 401) {
              autoLoginWithRefreshToken();
            } else {
              replyEventHandler("error", "User session ended!");
              callback(new Error(`Error calling auth endpoint: ${err}`), {
                auth: "",
              });
            }
          });
      },
    };
  };

  pusherClient = new Pusher(pusherAppId, {
    cluster: pusherCluster,
    authorizer: authorizer,
  });

  channel = pusherClient.subscribe(`private-${hotelSlug}-pos`);

  channel.bind("pusher:subscription_succeeded", function (status) {
    log.info(`Subscribed to pusher channel: private-${hotelSlug}-pos`);
  });

  channel.bind("pusher:subscription_error", function (status) {
    log.error(status);
  });

  channel.bind("request.created", function (data) {
    if (requestIds.indexOf(data.check_id) == -1) {
      log.info("request.created", data);
      requestIds.push(data.check_id);
      openCheck(data);
    }
  });

  channel.bind("update.menu", function (data) {
    log.info("update.menu");
    getRevenueCentersRequest(data);
  });
};

module.exports = { pusher };
