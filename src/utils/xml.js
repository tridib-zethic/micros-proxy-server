const xml2js = require("xml2js");
const log = require("electron-log");

const parseRevenueCentersXmlResponse = (xmlRes) => {
  // pass options to remove soap prefixes
  var options = {
    explicitArray: false,
    tagNameProcessors: [xml2js.processors.stripPrefix],
  };

  let resp = new Promise((resolve, reject) => {
    xml2js.parseString(xmlRes, options, (err, result) => {
      // catch error
      if (err) {
        reject(err);
      }

      // check if keys exists
      if (
        !checkNestedParameter(
          result,
          "Envelope",
          "Body",
          "GetConfigurationInfoResponse",
          "configInfoResponse",
          "RevenueCenters"
        )
      ) {
        reject("Unexpected Response");
      }

      // parse again to retrieve menu items
      xml2js
        .parseStringPromise(
          result.Envelope.Body.GetConfigurationInfoResponse.configInfoResponse
            .RevenueCenters
        )
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  });
  return resp;
};

/**
 * Parse XML response
 * @param string xmlData
 * @returns obj
 */
const parseXml = (xmlData) => {
  // pass options to remove soap prefixes
  var options = {
    explicitArray: false,
    tagNameProcessors: [xml2js.processors.stripPrefix],
  };
  let resp = new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, options, (err, result) => {
      // catch error
      if (err) {
        reject(err);
      }

      // check if keys exists
      if (
        !checkNestedParameter(
          result,
          "Envelope",
          "Body",
          "GetConfigurationInfoResponse",
          "configInfoResponse",
          "MenuItemMasters"
        )
      ) {
        reject("Unexpected Response");
      }

      // parse again to retrieve menu items
      xml2js
        .parseStringPromise(
          result.Envelope.Body.GetConfigurationInfoResponse.configInfoResponse
            .MenuItemMasters
        )
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  });

  return resp;
};

/**
 * Parse XML response
 * @param string xmlData
 * @returns obj
 */
const parseXmlArr = (xmlData) => {
  // pass options to remove soap prefixes
  var options = {
    explicitArray: false,
    tagNameProcessors: [xml2js.processors.stripPrefix],
  };
  let resp = new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, options, (err, result) => {
      // catch error
      if (err) {
        reject(err);
      }

      // check if keys exists
      if (
        !checkNestedParameter(
          result,
          "Envelope",
          "Body",
          "GetConfigurationInfoResponse",
          "configInfoResponse"
        )
      ) {
        reject("Unexpected Response");
      }

      // parse again to retrieve menu items
      xml2js
        .parseStringPromise(
          result.Envelope.Body.GetConfigurationInfoResponse.configInfoResponse
        )
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  });

  return resp;
};

/**
 * Equivalent to obj.hasOwnProperty but for nested levels
 * @param {*} obj
 * @param {*} level
 * @param  {...any} rest
 * @returns
 */
const checkNestedParameter = (obj, level, ...rest) => {
  if (obj === undefined) return false;
  if (rest.length == 0 && obj.hasOwnProperty(level)) return true;
  return checkNestedParameter(obj[level], ...rest);
};

// Extract Menu Items from response data
const formatMenuItemsArray = (data, revenueCenter) => {
  return data.map((menu) => {
    return {
      menu_id: menu.ObjectNumber[0],
      name: menu.Name[0].StringText[0],
      revenue_center: revenueCenter,
    };
  });
};

// Extract detailed menu items from response data
const formatMenuItemsDetailedArray = () => {
  return data.map((menu) => {
    const definitionSequence = {};
    return {
      menu_id: menu.ObjectNumber[0],
      name: menu.Name[0].StringText[0],
      revenue_center: revenueCenter,
      definition_sequence: definitionSequence
    };
  });
};

// Extract Revenue centers from response data
const formatRevenueCenterArray = (data) => {
  return data.map((menu) => {
    return menu.ObjectNumber[0];
  });
};

module.exports = {
  parseXml,
  parseXmlArr,
  formatMenuItemsArray,
  formatMenuItemsDetailedArray,
  parseRevenueCentersXmlResponse,
  formatRevenueCenterArray,
};
