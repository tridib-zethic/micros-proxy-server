const { default: axios } = require("axios");
const log = require("electron-log");

function sendRequest() {
  const xmlBody = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <GetConfigurationInfo xmlns="http://micros-hosting.com/EGateway/">
        <vendorCode />
        <employeeObjectNum>900000092</employeeObjectNum>
        <configurationInfoType>
          <int>1</int>
        </configurationInfoType>
        <revenueCenter>11</revenueCenter>
        <configInfoResponse />
      </GetConfigurationInfo>
    </soap:Body>
  </soap:Envelope>`;

  log.info(xmlBody);

  axios({
    method: "get",
    url: "https://private-anon-0074a846ea-simphonytsapi.apiary-mock.com/16/EGateway/SimphonyPosApiWeb.asmx",
    responseType: "stream",
  })
    .then(function (response) {
      log.info(response);
    })
    .catch(function (error) {
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
}

module.exports = sendRequest();
