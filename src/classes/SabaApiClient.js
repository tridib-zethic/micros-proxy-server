const { default: axios } = require("axios");
const log = require("electron-log");
const https = require("https");
const keytar = require("keytar");
const { authHeader } = require("../utils/auth");
const { hotelDashboardURL } = require("../utils/constants");

const { hotelBaseUrl, hotelBaseUrlError } = Promise.resolve(
  hotelDashboardURL
).then((result) => result.data);

let defaultUrl = "https://demo.dashboard.chatbothotels.com/api/v1";

let url = "";

if (hotelBaseUrl) {
  url = hotelBaseUrl + "/api/v1";
} else {
  url = defaultUrl;
}

const clientId = "1";
const clientSecret = "MBr4dqsss0Qn4UcXLW3tTWYA5qk2IkevqhEwvDDj";

const login = (data, pusher, pusherClient, event, win) => {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    headers: {
      post: {
        "application-type": "proxy",
      },
    },
  });
  url = `${data.hotel}/api/v1`;
  keytar.setPassword("login", "hotel", data.hotel);
  data["grant_type"] = "password";
  data["scope"] = "*";
  data["client_id"] = clientId;
  data["client_secret"] = clientSecret;

  instance
    .post(url + "/login", data)
    .then(async function (response) {
      log.info(response.data.access_token);
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
      pusher(win, event);
      setTimeout(() => {
        win.hide();
      }, 5000);
    })
    .catch((error) => {
      log.info("Status Code: ", error?.response?.status);
      // log.info("login payload", JSON.stringify(data));
      log.error("SabaApiClient.js - line:70", error?.response?.data);
    });
};

const postRevenueCenters = async (revenueCenters, hotel_id = 2) => {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
  instance
    .post(
      url + "/simphony/revenue_centers",
      {
        hotel_id: hotel_id,
        items: revenueCenters,
      },
      {
        headers: {
          Authorization: await authHeader(),
        },
      }
    )
    .then((response) => {
      log.info(response.data);
    })
    .catch((error) => {
      log.info("Status Code: ", error?.response?.status);
      // log.info(
      //   "revenue centers payload",
      //   JSON.stringify({
      //     hotel_id: hotel_id,
      //     items: revenueCenters,
      //   })
      // );
      log.error("SabaApiClient.js - line:105", error?.response?.data);
    });
};

const postMenuItems = async (menuItems, revenueCenter = 11, hotel_id = 2) => {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
  instance
    .post(
      url + "/simphony/menu_item",
      {
        hotel_id: hotel_id,
        items: menuItems,
      },
      {
        headers: {
          Authorization: await authHeader(),
        },
      }
    )
    .then((response) => {
      log.info(response.data);
    })
    .catch((error) => {
      log.info("Status Code: ", error?.response?.status);
      // log.info(
      //   "menu items payload",
      //   JSON.stringify({
      //     hotel_id: hotel_id,
      //     items: menuItems,
      //   })
      // );
      log.error("SabaApiClient.js - line:140", error?.response?.data);
    });
};

module.exports = { login, postRevenueCenters, postMenuItems };
