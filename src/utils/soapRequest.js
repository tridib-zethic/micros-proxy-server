const employeeObjectNum = `2130`;

// Create soap request strings for simphony post, return array of strings
const createNewCheckRequestBody = (revenueCenterItems) => {
  let checks = [];

  revenueCenterItems.forEach((items) => {
    checks.push(createSoapRequestBody(items));
  });

  return checks;
};

const createSoapRequestBody = (items) => {
  const date = new Date();

  const requestBodyPart1 = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <PostTransactionEx xmlns="http://micros-hosting.com/EGateway/">
            <vendorCode />
            <pGuestCheck>
                <CheckDateToFire>${date.toISOString()}</CheckDateToFire>
                <CheckEmployeeObjectNum>${employeeObjectNum}</CheckEmployeeObjectNum>
                <CheckGuestCount>0</CheckGuestCount>
                <CheckID />
                <CheckNum>0</CheckNum>
                <CheckOrderType>1</CheckOrderType>
                <CheckRevenueCenterID>${
                  items[0]["revenue_center"]
                }</CheckRevenueCenterID>
                <CheckSeq>0</CheckSeq>
                <CheckStatusBits>0</CheckStatusBits>
                <CheckTableObjectNum>1</CheckTableObjectNum>
                <PCheckInfoLines>
                    <string />
                    <string />
                </PCheckInfoLines>
                <EventObjectNum>0</EventObjectNum>
            </pGuestCheck>
            <ppMenuItems>
                <SimphonyPosApi_MenuItem>
    `;

  let requestBodyPart2 = "";

  const requestBodyPart3 = `</SimphonyPosApi_MenuItem>
            </ppMenuItems>
            <ppComboMeals />
            <pServiceChg>
                <SvcChgObjectNum>0</SvcChgObjectNum>
            </pServiceChg>
            <pSubTotalDiscount>
                <DiscObjectNum>0</DiscObjectNum>
            </pSubTotalDiscount>
            <pTmedDetail>
                <TmedEPayment>
                    <AccountDataSource>SOURCE_UNDEFINED</AccountDataSource>
                    <AccountType>ACCOUNT_TYPE_UNDEFINED</AccountType>
                    <ExpirationDate>0001-01-01T00:00:00</ExpirationDate>
                    <IssueNumber>0</IssueNumber>
                    <PaymentCommand>NO_E_PAYMENT</PaymentCommand>
                    <StartDate>0001-01-01T00:00:00</StartDate>
                </TmedEPayment>
                <TmedObjectNum>902</TmedObjectNum>
                <TmedPartialPayment />
                <TmedReference />
            </pTmedDetail>
            <pTotalsResponse />
            <ppCheckPrintLines>
                <string />
            </ppCheckPrintLines>
            <ppVoucherOutput>
                <string />
            </ppVoucherOutput>
        </PostTransactionEx>
    </soap:Body>
</soap:Envelope>`;

  items.forEach((item) => {
    const itemXml = `<MenuItem>
        <ItemDiscount>
            <DiscObjectNum>0</DiscObjectNum>
        </ItemDiscount>
        <MiObjectNum>${item["item_object_number"]}</MiObjectNum>
        <MiOverridePrice />
        <MiReference />
        <MiWeight />
    </MenuItem>`;

    requestBodyPart2 = requestBodyPart2 + itemXml;
  });

  return requestBodyPart1 + requestBodyPart2 + requestBodyPart3;
};

const createGetRevenueCenterRequestBody = () => {
  return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetConfigurationInfo xmlns="http://localhost:8080/EGateway/">
      <vendorCode />
      <employeeObjectNum>${employeeObjectNum}</employeeObjectNum>
      <configurationInfoType>
        <int>11</int>
      </configurationInfoType>
      <revenueCenter>11</revenueCenter>
      <configInfoResponse />
    </GetConfigurationInfo>
  </soap:Body>
</soap:Envelope>`;
};

module.exports = {
  createNewCheckRequestBody,
  createGetRevenueCenterRequestBody,
};
