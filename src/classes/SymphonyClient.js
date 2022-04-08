const { default: axios } = require("axios");
const log = require("electron-log");
const {
  createNewCheckRequestBody,
  createGetRevenueCenterRequestBody,
  createGetMenuItemsRequestBody,
  createGetDefinitionsRequestBody,
  createGetPriceRequestBody,
} = require("../utils/soapRequest");
const {
  parseXml,
  parsePriceXml,
  parseDefinitionXml,
  formatMenuItemsArray,
  formatMenuItemsDetailedArray,
  parseRevenueCentersXmlResponse,
  formatRevenueCenterArray,
} = require("../utils/xml");
const { postRevenueCenters, postMenuItems } = require("./SabaApiClient");

const simphonyEndpoint =
  "http://172.40.104.8:8080/EGateway/SimphonyPosAPIWeb.asmx";

// Send request to pos to get list of revenue centers
const getRevenueCentersRequest = (data = {}) => {
  let hotel_id = 2;
  if (data?.hotel_id) {
    hotel_id = data.hotel_id;
  }
  const soapRequestBody = createGetRevenueCenterRequestBody();
  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: "http://172.40.104.8:8080/EGateway/GetConfigurationInfo",
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
    SOAPAction: "http://172.40.104.8:8080/EGateway/GetConfigurationInfo",
  };

  axios
    .post(simphonyEndpoint, soapRequestBody, {
      headers,
    })
    .then((response) => {
      // parse xml response
      parseXml(response.data)
        .then((res) => {
          const menuItems = res.ArrayOfDbMenuItemMaster.DbMenuItemMaster;

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
  const soapRequestBody1 = createGetPriceRequestBody(revenueCenter);
  const soapRequestBody2 = createGetMenuItemsRequestBody(revenueCenter);
  const soapRequestBody3 = createGetDefinitionsRequestBody(revenueCenter);

  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: "http://172.40.104.8:8080/EGateway/GetConfigurationInfo",
  };

  let menuDefinitions = [];
  let menuItemElements = [];
  let priceDetailsArray = [];

  let menuItems = [];

  // menu items definitions
  await axios
    .post(simphonyEndpoint, soapRequestBody3, {
      headers,
    })
    .then((response) => {
      // parse definition xml
      parseDefinitionXml(response.data)
        .then((res) => {
          menuDefinitions =
            res.ArrayOfDbMenuItemDefinition.DbMenuItemDefinition;
        })
        .catch((err) => {
          log.error(
            "MICROS Menu Definitions XML Parse Error: (SymphonyClient.js - Line:144)",
            err
          );
        });
    })
    .catch((error) => {
      log.error(
        "MICROS Menu Definitions Fetch Error: (SymphonyClient.js - Line:147)",
        error
      );
    });

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
        .catch((err) => {
          log.error(
            "MICROS Menu Items XML Parse Error: (SymphonyClient.js - Line:162)",
            err
          );
        });
    })
    .catch((error) => {
      log.error(
        "MICROS Menu Items Fetch Error: (SymphonyClient.js - Line:166)",
        error
      );
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
        .catch((err) => {
          log.error(
            "MICROS Menu Price XML Parse Error: (SymphonyClient.js - Line:181)",
            err
          );
        });
    })
    .catch((error) => {
      log.error(
        "MICROS Menu Price Fetch Error: (SymphonyClient.js - Line:185)",
        error
      );
    });

  // Get file updates
  await menuItemElements.forEach((item, index) => {
    let productItem = { ...item };
    const menuDefinitionItem = menuDefinitions.find(
      (def) => def["MenuItemMasterID"] == item["MenuItemMasterID"]
    );
    const priceElement = priceDetailsArray.find(
      (el) => el["MenuItemDefID"] == menuDefinitionItem["MenuItemDefID"]
    );
    // let defaultPriceElement = {
    //   "MenuItemPriceID": [
    //       "77805"
    //   ],
    //   "HierStrucID": [
    //       "3390"
    //   ],
    //   "MenuItemDefID": [
    //       "61380"
    //   ],
    //   "SequenceNum": [
    //       "1"
    //   ],
    //   "MenuLvlIndex": [
    //       "0"
    //   ],
    //   "OptionBits": [
    //       "00000000"
    //   ],
    //   "Price": [
    //       "0"
    //   ],
    //   "PrepCost": [
    //       "0"
    //   ],
    //   "RecipeNameID": [
    //       "0"
    //   ],
    //   "PriceGroupID": [
    //       "0"
    //   ],
    //   "TaxClassObjNum": [
    //       "0"
    //   ],
    //   "ChangeSetObjNum": [
    //       "0"
    //   ],
    //   "PosRef": [
    //       "0"
    //   ],
    //   "ServiceChargeGroupObjNum": [
    //       "0"
    //   ],
    //   "ParentTaxClassOvrdObjNmbr": [
    //       "0"
    //   ]
    // };
    // if(priceDetailsArray[index]) {
    //   priceElement = priceDetailsArray[index];
    // } else {
    //   priceElement = defaultPriceElement;
    // }
    productItem.DefinitionSequence = priceElement;

    menuItems.push(productItem);
  });
  let formattedMenuItems = formatMenuItemsDetailedArray(
    menuItems,
    revenueCenter
  );
  postMenuItems(formattedMenuItems, revenueCenter, hotel_id);
};

// Send Request to open multiple checks
const openCheck = (items) => {
  // array of check request body strings
  const checks = createNewCheckRequestBody(items);
  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    // SOAPAction: "http://172.40.104.8:8080/EGateway/PostTransactionEx",
    SOAPAction: "http://172.40.104.8:8080/EGateway/PostTransactionEx2",
  };

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
