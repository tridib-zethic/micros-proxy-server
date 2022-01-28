const { default: axios } = require("axios");
const log = require("electron-log");
const {
  createNewCheckRequestBody,
  createGetRevenueCenterRequestBody,
  createGetMenuItemsRequestBody,
  createGetDetailedMenuItemsRequestBody,
} = require("../utils/soapRequest");
const {
  parseXml,
  parseXmlArr,
  formatMenuItemsArray,
  formatMenuItemsDetailedArray,
  createGetDefinitionsRequestBody,
  createGetPriceRequestBody,
  parseRevenueCentersXmlResponse,
  formatRevenueCenterArray,
} = require("../utils/xml");
const { postRevenueCenters, postMenuItems } = require("./SabaApiClient");

const simphonyEndpoint =
  "http://127.0.0.1:8080/EGateway/SimphonyPosAPIWeb.asmx";

// Send request to pos to get list of revenue centers
const getRevenueCentersRequest = (data = {}) => {
  let hotel_id = 2;
  if(data?.hotel_id) {
    hotel_id = data.hotel_id;
  }
  const soapRequestBody = createGetRevenueCenterRequestBody();
  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: "http://localhost:8080/EGateway/GetConfigurationInfo",
  };
  axios
    .post(simphonyEndpoint, soapRequestBody, {
      headers,
    })
    .then((response) => {
      // parse xml response
      parseRevenueCentersXmlResponse(response.data)
        .then((res) => {
          // Extract Revenue centers from response data
          const revenueCenters = formatRevenueCenterArray(
            res.ArrayOfDbRvcConfiguration.DbRvcConfiguration
          );

          // send revenue centers name and ids to api server
          postRevenueCenters(revenueCenters, hotel_id);

          // fetch and save menu items from all revenue center to api server
          getAllMenuItems(revenueCenters, hotel_id);
        })
        .catch((err) => log.error("XML Parse Error: ", err));
    })
    .catch((error) => {
      if (error.response) {
        log.error(error.response.data);
        log.error(error.response.status);
        log.error(error.response.headers);
      } else {
        log.error("Error", error.message);
      }
    });
};

// Send request to get menu items from array of revenue center
const getAllMenuItems = (revenueCenters, hotel_id = 2) => {
  revenueCenters.forEach((revenueCenter) => {
    getMenuItemRequest(revenueCenter, hotel_id);
  });
};

// Send request to get menu item from revenue center no, then save it to backend server
const getMenuItemRequest = (revenueCenter, hotel_id = 2) => {
  const soapRequestBody = createGetMenuItemsRequestBody(revenueCenter);
  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: "http://localhost:8080/EGateway/GetConfigurationInfo",
  };

  axios
    .post(simphonyEndpoint, soapRequestBody, {
      headers,
    })
    .then((response) => {
      // parse xml response
      parseXml(response.data)
        .then((res) => {
          const menuItems =
            res.ArrayOfDbMenuItemMaster.DbMenuItemMaster;

          const menuItemsArray = formatMenuItemsArray(menuItems, revenueCenter);

          // post menu items to saba api
          postMenuItems(menuItemsArray, revenueCenter, hotel_id);
        })
        .catch((err) => log.error(err));
    })
    .catch((error) => {
      if (error.response) {
        // Request made and server responded
        log.error(error.response.data);
        log.error(error.response.status);
        log.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        log.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        log.error("Error", error.message);
      }
    });
};

// Send request to get menu item from revenue center no, then save it to backend server
const getMenuItemDetailsRequest = (revenueCenter, hotel_id = 2) => {
  const soapRequestBody = createGetDetailedMenuItemsRequestBody(revenueCenter);
  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: "http://localhost:8080/EGateway/GetConfigurationInfo",
  };

  axios
    .post(simphonyEndpoint, soapRequestBody, {
      headers,
    })
    .then((response) => {
      // parse xml response
      parseXmlArr(response.data)
        .then((res) => {
          const menuItems = res;
          log.info(menuItems);
          // const menuItemsArray = formatMenuItemsDetailedArray(menuItems, revenueCenter);
          // log
          // post menu items to saba api
          // postMenuItems(menuItemsArray, revenueCenter, hotel_id);
        })
        .catch((err) => log.error(err));
    })
    .catch((error) => {
      if (error.response) {
        // Request made and server responded
        log.error(error.response.data);
        log.error(error.response.status);
        log.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        log.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        log.error("Error", error.message);
      }
    });
};



// Send Request to open multiple checks
const openCheck = (items) => {
  // array of check request body strings
  const checks = createNewCheckRequestBody(items);
  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    // SOAPAction: "http://localhost:8080/EGateway/PostTransactionEx",
    SOAPAction: "http://localhost:8080/EGateway/PostTransactionEx2"
  };
  log.info("openCheck", checks);

  checks.forEach((checkRequestBody) => {
    // send post request to open check
    axios
      .post(simphonyEndpoint, checkRequestBody, {
        headers,
      })
      .then((response) => {
        log.info("success", response.data);
      })
      .catch((error) => {
        if (error.response) {
          // Request made and server responded
          log.error(error.response.data);
          log.error(error.response.status);
          log.error(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          log.error(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          log.error("Error", error.message);
        }
      });
  });
};

module.exports = { openCheck, getRevenueCentersRequest };
