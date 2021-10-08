const xml2js = require("xml2js");

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

const menuItemsArray = (data) => {
  return data.map((menu) => {
    return {
      menu_id: menu.MiMasterObjNum[0],
      name: menu.Name1[0].StringText[0],
      revenue_center: 10,
    };
  });
};

module.exports = { parseXml, menuItemsArray };
