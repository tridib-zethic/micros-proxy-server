const { default: axios } = require("axios");
const log = require("electron-log");
const https = require("https");
const keytar = require("keytar");
const { authHeader } = require("../utils/auth");
const { hotelDashboardURL } = require("../utils/constants");

const hotelBaseUrl = hotelDashboardURL();
let url = "https://demo.dashboard.chatbothotels.com/api/v1";

if (hotelBaseUrl) {
  url = hotelBaseUrl + "/api/v1";
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
  url = `${data.hotel}/api`;
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
    .catch(function (error) {
      log.error("Login error in saba backend", error);
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
      log.info(
        "Success storing revenue centers in saba backend",
        response.data
      );
    })
    .catch((error) => {
      log.error("Error storing revenue centers in saba backend", error);
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
      log.info("Success for menu items store in saba backend", response.data);
    })
    .catch((error) => {
      log.error("error storing menu items to saba backend", error);
    });
};

module.exports = { login, postRevenueCenters, postMenuItems };
