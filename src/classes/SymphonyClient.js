const { default: axios } = require("axios");
const log = require("electron-log");
const {
  createNewCheckRequestBody,
  createGetRevenueCenterRequestBody,
  createGetMenuItemsRequestBody,
  createGetDefinitionsRequestBody,
  createGetPriceRequestBody,
  // getSimphonyMenuItemsDefinition,
  // getSimphonyMenuItemCategory,
  // getSimphonyMenuItemConfigurations,
  getSimphonyMenuItemClasses,
} = require("../utils/soapRequest");
const {
  parseXml,
  parsePriceXml,
  parseDefinitionXml,
  formatMenuItemsDetailedArray,
  parseRevenueCentersXmlResponse,
  formatRevenueCenterArray,
  formatRevenueCenterArrayElements,
  parseItemClassXml,
} = require("../utils/xml");
const { postRevenueCenters, postMenuItems } = require("./SabaApiClient");

let simphonyBaseUrl = "http://localhost:8080/EGateway";
let simphonyEndpoint = `${simphonyBaseUrl}/SimphonyPosAPIWeb.asmx`;
let simphonyConfigUrl = `${simphonyBaseUrl}/GetConfigurationInfo`;
let revenueCenterId = "11";
let employeeObjectNumber = "2130";

// Send request to pos to get list of revenue centers
const getRevenueCentersRequest = (data = {}) => {
  // Micros Settings data
  simphonyBaseUrl = data.micros_base_url;
  revenueCenterId = data.micros_revenue_center;
  employeeObjectNumber = data.micros_employee_id;
  // const symphonyConfig = {
  //   simphonyBaseUrl: data.micros_base_url,
  //   revenueCenterId: data.micros_revenue_center,
  //   employeeObjectNumber: data.micros_employee_id,
  // };

  let hotel_id = 2;
  if (data?.hotel_id) {
    hotel_id = data.hotel_id;
  }
  const soapRequestBody = createGetRevenueCenterRequestBody(
    simphonyBaseUrl,
    revenueCenterId,
    employeeObjectNumber
  );
  log.info("Revenue centers xml body", soapRequestBody);
  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: simphonyConfigUrl,
  };
  axios
    .post(simphonyEndpoint, soapRequestBody, {
      headers,
    })
    .then((response) => {
      console.log("Revenue center request", response.data);
      // parse xml response
      parseRevenueCentersXmlResponse(response.data)
        .then((res) => {
          // Extract Revenue centers from response data
          const revenueCenters = formatRevenueCenterArray(
            res.ArrayOfDbRvcConfiguration.DbRvcConfiguration
          );

          const formattedRevenueCenters = formatRevenueCenterArrayElements(
            res.ArrayOfDbRvcConfiguration.DbRvcConfiguration
          );

          // send revenue centers name and ids to api server
          postRevenueCenters(formattedRevenueCenters, hotel_id);

          // fetch and save menu items from all revenue center to api server
          getAllMenuItems(revenueCenters, hotel_id, employeeObjectNumber);
        })
        .catch((err) => log.error("XML Parse Error: ", err));
    })
    .catch((error) => {
      log.error("SymphonyClient.js - Line:82", error);
    });
};

// Send request to get menu items from array of revenue center
const getAllMenuItems = (
  revenueCenters,
  hotel_id = 2,
  employeeObjectNumber
) => {
  revenueCenters.forEach((revenueCenter) => {
    // getMenuItemRequest(revenueCenter, hotel_id);
    getMenuItemDetailsRequest(revenueCenter, hotel_id, employeeObjectNumber);
  });
};

// Send request to get menu item from revenue center no, then save it to backend server
const getMenuItemDetailsRequest = async (
  revenueCenter,
  hotel_id = 2,
  employeeObjectNumber
) => {
  const soapRequestBody1 = createGetPriceRequestBody(
    revenueCenter,
    simphonyBaseUrl,
    employeeObjectNumber
  );
  log.info("Menu price xml body", soapRequestBody1);
  const soapRequestBody2 = createGetMenuItemsRequestBody(
    revenueCenter,
    simphonyBaseUrl,
    employeeObjectNumber
  );
  log.info("Menu items body xml", soapRequestBody1);
  const soapRequestBody3 = createGetDefinitionsRequestBody(
    revenueCenter,
    simphonyBaseUrl,
    employeeObjectNumber
  );
  log.info("Menu definitions xml body", soapRequestBody3);

  // const soapRequestMenuDefinition = getSimphonyMenuItemsDefinition(
  //   revenueCenter,
  //   simphonyBaseUrl,
  // employeeObjectNumber
  // );
  // const soapRequestMenuCategory = getSimphonyMenuItemCategory(
  //   revenueCenter,
  //   simphonyBaseUrl,
  // employeeObjectNumber
  // );
  const soapRequestMenuClass = getSimphonyMenuItemClasses(
    revenueCenter,
    simphonyBaseUrl,
    employeeObjectNumber
  );
  log.info("Menu class xml body", soapRequestMenuClass);

  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: simphonyConfigUrl,
  };

  let menuDefinitions = [];
  let menuItemElements = [];
  let priceDetailsArray = [];

  // let menuItemDefinitions = [];
  // let menuItemCategories = [];
  // let menuItemConfigurations = [];
  let menuItemClass = [];

  let menuItems = [];

  // menu items definitions
  await axios
    .post(simphonyEndpoint, soapRequestBody3, {
      headers,
    })
    .then((response) => {
      console.log("getMenuItemDetailsRequest definition", response.data);
      // parse definition xml
      parseDefinitionXml(response.data)
        .then((res) => {
          menuDefinitions =
            res.ArrayOfDbMenuItemDefinition.DbMenuItemDefinition;
          // log.info("*** Menu Item Definition ***", menuDefinitions);
        })
        .catch((err) => {
          log.error(
            "MICROS Menu Definitions XML Parse Error: (SymphonyClient.js - Line:162)",
            err
          );
        });
    })
    .catch((error) => {
      log.error(
        "MICROS Menu Definitions Fetch Error: (SymphonyClient.js - Line:169)",
        error
      );
    });

  // menu items elements
  await axios
    .post(simphonyEndpoint, soapRequestBody2, {
      headers,
    })
    .then((response) => {
      console.log("getMenuItemDetailsRequest menu items", response.data);
      // parse xml response
      parseXml(response.data)
        .then((res) => {
          menuItemElements = res.ArrayOfDbMenuItemMaster.DbMenuItemMaster;
        })
        .catch((err) => {
          log.error(
            "MICROS Menu Items XML Parse Error: (SymphonyClient.js - Line:187)",
            err
          );
        });
    })
    .catch((error) => {
      log.error(
        "MICROS Menu Items Fetch Error: (SymphonyClient.js - Line:194)",
        error
      );
    });

  // Get menu item prices
  await axios
    .post(simphonyEndpoint, soapRequestBody1, {
      headers,
    })
    .then((response) => {
      console.log("getMenuItemDetailsRequest menu items price", response.data);
      // parse xml response
      parsePriceXml(response.data)
        .then((res) => {
          priceDetailsArray = res.ArrayOfDbMenuItemPrice.DbMenuItemPrice;
        })
        .catch((err) => {
          log.error(
            "MICROS Menu Price XML Parse Error: (SymphonyClient.js - Line:212)",
            err
          );
        });
    })
    .catch((error) => {
      log.error(
        "MICROS Menu Price Fetch Error: (SymphonyClient.js - Line:219)",
        error
      );
    });

  // // Get menu item definitions
  // await axios
  //   .post(simphonyEndpoint, soapRequestMenuDefinition, {
  //     headers,
  //   })
  //   .then((res) => {
  //     log.info("*** Menu Definitions ***");
  //     // log.info(res.data);
  //   })
  //   .catch((err) => {
  //     log.error("xxx Menu Item Definition Error xxx");
  //     log.error(err);
  //   });

  // // Get menu item categories
  // await axios
  //   .post(simphonyEndpoint, soapRequestMenuCategory, {
  //     headers,
  //   })
  //   .then((res) => {
  //     log.info("*** Menu Categories ***");
  //     // log.info(res.data);
  //   })
  //   .catch((err) => {
  //     log.error("xxx Menu Item Category Error xxx");
  //     log.error(err);
  //   });

  // // Get menu item class
  await axios
    .post(simphonyEndpoint, soapRequestMenuClass, {
      headers,
    })
    .then((res) => {
      parseItemClassXml(res.data)
        .then((response) => {
          menuItemClass = response.ArrayOfDbMenuItemClass.DbMenuItemClass;
          // log.info("*** Menu class ***", menuItemClass);
        })
        .catch((error) => {
          log.error("Menu Item Class Parse Error", error);
        });
      // log.info("*** Menu class ***");
      // log.info(res.data);
    })
    .catch((err) => {
      log.error("xxx Menu Item class Error xxx");
      log.error(err);
    });

  // Get file updates
  await menuItemElements.forEach((item, index) => {
    try {
      let productItem = { ...item };
      const menuDefinitionItem = menuDefinitions.find(
        (def) => def["MenuItemMasterID"][0] == item["MenuItemMasterID"][0]
      );
      const priceElement = priceDetailsArray.find(
        (el) => el["MenuItemDefID"][0] == menuDefinitionItem["MenuItemDefID"][0]
      );
      productItem.DefinitionSequence = priceElement;
      menuItems.push(productItem);
    } catch (error) {
      console.log("Couldn't add menu item", item);
    }
  });
  let formattedMenuItems = formatMenuItemsDetailedArray(
    menuItems,
    revenueCenter
  );
  postMenuItems(formattedMenuItems, revenueCenter, hotel_id);
};

// Send Request to open multiple checks
const openCheck = (items) => {
  // Micros Settings data
  simphonyBaseUrl = items.micros_base_url;
  revenueCenterId = items.micros_revenue_center;
  employeeObjectNumber = items.micros_employee_id;

  // array of check request body strings
  let checks = [];
  if (items.orders) {
    checks = createNewCheckRequestBody(items, employeeObjectNumber);
  }
  let headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    // SOAPAction: `${simphonyBaseUrl}/PostTransactionEx`,
    SOAPAction: `${simphonyBaseUrl}/PostTransactionEx2`,
  };

  if (checks.length > 0) {
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
          log.error("SymphonyClient.js line:318", error);
        });
    });
  }
};

// module.exports = { openCheck, getRevenueCentersRequest, employeeObjectNumber };
module.exports = { openCheck, getRevenueCentersRequest };
