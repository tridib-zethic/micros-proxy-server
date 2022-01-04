const log = require("electron-log");
const { authHeader } = require("../utils/auth");
const Pusher = require("pusher-js");
const { openCheck, getRevenueCentersRequest } = require("./SymphonyClient");
const { hotelDashboardURL, pusherCluster, pusherAppId } = require("../utils/constants");
const axios = require("axios");
const https = require("https");

Pusher.logToConsole = true;

const pusher = async () => {
  const token = await authHeader();
  const hotel = await hotelDashboardURL();
  const hotelSlug = hotel.split('.')[0].split("//")[1];
  log.info(token);

  const authorizer = (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        const data = new URLSearchParams();
        data.append('socket_id', socketId);
        data.append('channel_name', channel.name);

        const apiUri = `${hotel}/api/auth/private-channel`;

        const instance = axios.create({
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        });
        instance
          .post(
            apiUri,
            data,
            {
              headers: {
                // Authorization: await authHeader(),
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest",
                "Authorization": token,
              },
            }
          ).then(res => {
            log.info('Pusher Client Success');
          log.info('Success', res.data);
          // replyEventHandler("success", "Login Successful!");
          callback(null, res.data);
        }).catch(err => {
          log.info('Error', err);
          // replyEventHandler("error", "User session ended!");
          callback(new Error(`Error calling auth endpoint: ${err}`), {
           auth: ''
          });
        });
      }
    };
  };

  // const pusherClient = new Pusher("4b2c0457861dd98fc950", {
  //   cluster: "ap1",
  //   authEndpoint:
  //     "https://demo.dashboard.chatbothotels.com/api/auth/private-channel",
  //   auth: {
  //     headers: {
  //       "X-Requested-With": "XMLHttpRequest",
  //       Authorization: token,
  //     },
  //   },
  // });

  
  const pusherClient = new Pusher(pusherAppId, {
    cluster: pusherCluster,
    authorizer: authorizer,
  });

  // log.info(pusherClient);

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
    log.info("request.created", data);
    openCheck(data);
  });

  channel.bind("update.menu", function (data) {
    getRevenueCentersRequest(data);
  });
};

module.exports = { pusher };
