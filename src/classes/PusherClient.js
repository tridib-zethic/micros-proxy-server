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
  const url = `${hotel}/api`;
  const clientId = "1";
  const clientSecret = "MBr4dqsss0Qn4UcXLW3tTWYA5qk2IkevqhEwvDDj";

  let data = [];

  data["grant_type"] = "refresh_token";
  data["refresh_token"] = authRefreshToken;
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
      let errMsg = "Unable to login";
      if (error.response) {
        // Request made and server responded
        log.error(error.response.data);
        if (error?.response?.data?.message) {
          errMsg = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        log.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        log.error("Error", error);
      }
    });
};

const pusher = async (win = undefined, event = undefined) => {
  token = await authHeader();
  hotel = await hotelDashboardURL();
  hotelSlug = hotel.split(".")[0].split("//")[1];

  if (hotel) {
    // do nothing
  } else {
    hotel = "https://fina.dashboard.guest-chat.com.com";
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
            if (err.response.status == 401) {
              autoLoginWithRefreshToken();
            } else {
              log.info("Error", err);
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
    log.info("Hello");
  });

  channel.bind("pusher:subscription_error", function (status) {
    log.error(status);
  });

  channel.bind("request.created", function (data) {
    log.info("request.created", data);
    openCheck(data);
  });

  channel.bind("update.menu", function (data) {
    getRevenueCentersRequest(data);
  });
};

module.exports = { pusher };
