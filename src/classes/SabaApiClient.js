const { default: axios } = require("axios");
const log = require("electron-log");
const https = require("https");
const keytar = require("keytar");
const { authHeader } = require("../utils/auth");

const url = "https://app.chatbothotels.com/api";
const clientId = "1";
const clientSecret = "MBr4dqsss0Qn4UcXLW3tTWYA5qk2IkevqhEwvDDj";

const login = (data) => {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

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
    })
    .catch(function (error) {
      if (error.response) {
        // Request made and server responded
        log.error(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        log.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        log.error("Error", error);
      }
    });
};

const postMenuItems = async (menuItems) => {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
  instance
    .post(
      url + "/simphony/menu_item",
      {
        hotel_id: 2,
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
      if (error.response) {
        // Request made and server responded
        log.error(error.response.data);
        log.error(error.response.status);
        log.error(error.response.headers);
      } else {
        // Something happened in setting up the request that triggered an Error
        log.error("Error", error.message);
      }
    });
};

module.exports = { login, postMenuItems };
