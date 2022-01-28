const { default: axios } = require("axios");
const log = require("electron-log");
const {
  createNewCheckRequestBody,
  createGetRevenueCenterRequestBody,
  createGetMenuItemsRequestBody,
  createGetDetailedMenuItemsRequestBody,
  createGetDefinitionsRequestBody,
  createGetPriceRequestBody,
} = require("../utils/soapRequest");
const {
  parseXml,
  parseXmlArr,
  parsePriceXml,
  formatMenuItemsArray,
  formatMenuItemsDetailedArray,
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
    // getMenuItemRequest(revenueCenter, hotel_id);
    getMenuItemDetailsRequest(revenueCenter, hotel_id);
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
const getMenuItemDetailsRequest = async (revenueCenter, hotel_id = 2) => {
  // const soapRequestBody = createGetDetailedMenuItemsRequestBody(revenueCenter);
  const soapRequestBody1 = createGetPriceRequestBody(revenueCenter);
  const soapRequestBody2 = createGetMenuItemsRequestBody(revenueCenter);

  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: "http://localhost:8080/EGateway/GetConfigurationInfo",
  };

  let menuItemElements = [];
  let priceDetailsArray = [];

  let menuItems = [];

  // menu items elements
  await axios
    .post(simphonyEndpoint, soapRequestBody2, {
      headers,
    })
    .then((response) => {
      // parse xml response
      parseXml(response.data)
        .then((res) => {
          menuItemElements = res.ArrayOfDbMenuItemMaster.DbMenuItemMaster;
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

    // Get menu item prices
    await axios
      .post(simphonyEndpoint, soapRequestBody1, {
        headers,
      })
      .then((response) => {
        // parse xml response
        parsePriceXml(response.data)
          .then((res) => {
            priceDetailsArray = res.ArrayOfDbMenuItemPrice.DbMenuItemPrice;
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

      // Get file updates
      await menuItemElements.forEach((item, index) => {
        let productItem = {...item};
        let priceElement = {
          "MenuItemPriceID": [
              "77805"
          ],
          "HierStrucID": [
              "3390"
          ],
          "MenuItemDefID": [
              "61380"
          ],
          "SequenceNum": [
              "1"
          ],
          "MenuLvlIndex": [
              "0"
          ],
          "OptionBits": [
              "00000000"
          ],
          "Price": [
              "0"
          ],
          "PrepCost": [
              "0"
          ],
          "RecipeNameID": [
              "0"
          ],
          "PriceGroupID": [
              "0"
          ],
          "TaxClassObjNum": [
              "0"
          ],
          "ChangeSetObjNum": [
              "0"
          ],
          "PosRef": [
              "0"
          ],
          "ServiceChargeGroupObjNum": [
              "0"
          ],
          "ParentTaxClassOvrdObjNmbr": [
              "0"
          ]
        };
        if(priceDetailsArray[index]) {
          priceElement = priceDetailsArray[index];
        }
        productItem.DefinitionSequence = priceElement;

        menuItems.push(productItem);
      });
      let formattedMenuItems = formatMenuItemsDetailedArray(menuItems, revenue_center);
      postMenuItems(formattedMenuItems, revenueCenter, hotel_id);
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
