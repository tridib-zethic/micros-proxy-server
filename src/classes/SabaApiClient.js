const { default: axios } = require("axios");
const log = require("electron-log");
const https = require("https");
const keytar = require("keytar");

const login = (data) => {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  data["grant_type"] = "password";
  data["scope"] = "*";
  data["client_id"] = "1";
  data["client_secret"] = "MBr4dqsss0Qn4UcXLW3tTWYA5qk2IkevqhEwvDDj";

  instance
    .post("https://app.local.com/api/login", data)
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

module.exports = { login };
