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
const parsePriceXml = (xmlData) => {
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
          "MenuItemPrice"
        )
      ) {
        reject("Unexpected Response");
      }

      // parse again to retrieve menu items
      xml2js
        .parseStringPromise(
          result.Envelope.Body.GetConfigurationInfoResponse.configInfoResponse
            .MenuItemPrice
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
const parseDefinitionXml = (xmlData) => {
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
          "MenuItemDefinitions"
        )
      ) {
        reject("Unexpected Response");
      }

      // parse again to retrieve menu items
      xml2js
        .parseStringPromise(
          result.Envelope.Body.GetConfigurationInfoResponse.configInfoResponse
            .MenuItemDefinitions
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
const formatMenuItemsDetailedArray = (data, revenueCenter) => {
  return data.map((menu) => {
    const definitionSequence = [
      {
        definitionSequence: menu?.DefinitionSequence?.SequenceNum[0]
          ? menu.DefinitionSequence.SequenceNum[0]
          : "1",
        name: {
          "en-US": menu.Name[0].StringText[0],
        },
        price: menu?.DefinitionSequence?.Price[0]
          ? parseFloat(menu.DefinitionSequence.Price[0]).toFixed(2)
          : 0.0,
      },
    ];
    return {
      menu_id: menu.ObjectNumber[0],
      name: menu.Name[0].StringText[0],
      revenue_center: revenueCenter,
      sequences: definitionSequence,
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
  parsePriceXml,
  formatMenuItemsArray,
  formatMenuItemsDetailedArray,
  parseRevenueCentersXmlResponse,
  formatRevenueCenterArray,
  parseDefinitionXml,
};
