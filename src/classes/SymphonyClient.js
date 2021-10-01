const { default: axios } = require("axios");
const log = require("electron-log");
const { parseXml, menuItemsArray } = require("../utils/xml");
const { postMenuItems } = require("./SabaApiClient");

const sendRequest = () => {
  const soapRequestBody = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetConfigurationInfo xmlns="http://localhost:8080/EGateway/">
      <vendorCode />
      <employeeObjectNum>900000092</employeeObjectNum>
      <configurationInfoType>
        <int>13</int>
      </configurationInfoType>
      <configInfoResponse />
    </GetConfigurationInfo>
  </soap:Body>
</soap:Envelope>
`;

  axios
    .post(
      "https://private-anon-5b1f3b7495-simphonytsapi.apiary-mock.com/16/EGateway/SimphonyPosApiWeb.asmx",
      soapRequestBody,
      {
        headers: { "Content-Type": "text/xml" },
      }
    )
    .then((response) => {
      // parse xml response
      parseXml(response.data)
        .then((res) => {
          const menuItems =
            res.ArrayOfDbMenuItemDefinition.DbMenuItemDefinition;

          const array = menuItemsArray(menuItems);

          // post menu items to saba api
          postMenuItems(array);
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

const openCheque = () => {
  const soapRequestBody = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetConfigurationInfo xmlns="http://localhost:8080/EGateway/">
      <vendorCode />
      <employeeObjectNum>900000092</employeeObjectNum>
      <configurationInfoType>
        <int>13</int>
      </configurationInfoType>
      <configInfoResponse />
    </GetConfigurationInfo>
  </soap:Body>
</soap:Envelope>
`;

  axios
    .post(
      "https://private-anon-5b1f3b7495-simphonytsapi.apiary-mock.com/16/EGateway/SimphonyPosApiWeb.asmx",
      soapRequestBody,
      {
        headers: { "Content-Type": "text/xml" },
      }
    )
    .then((response) => {
      // parse xml response
      parseXml(response.data)
        .then((res) => {
          const menuItems =
            res.ArrayOfDbMenuItemDefinition.DbMenuItemDefinition;

          const array = menuItemsArray(menuItems);

          // post menu items to saba api
          postMenuItems(array);
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

module.exports = { sendRequest };
