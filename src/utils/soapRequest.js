const employeeObjectNum = `2130`;
const { info } = require("electron-log");
const log = require("electron-log");

// Create soap request strings for simphony post, return array of strings
const createNewCheckRequestBody = (revenueCenterItems) => {
  let checks = [];
  const orderItems = revenueCenterItems.orders;
  const orderInformations = {
    order_instruction: revenueCenterItems.order_instruction,
    customer_name: revenueCenterItems.customer_name,
    room_number: revenueCenterItems.room_number,
    order_price: revenueCenterItems.order_price,
    payment_method: revenueCenterItems.payment_method,
    delivery_location: revenueCenterItems.delivery_location,
    guest_type: revenueCenterItems.guest_type,
    taxes: revenueCenterItems.taxes,
    svc: revenueCenterItems.svc,
    tray_charges: revenueCenterItems.tray_charges,
    schedule_time: revenueCenterItems.schedule_time,
    schedule_day: revenueCenterItems.schedule_day,
    location_name: revenueCenterItems.location_name
  };
  // revenueCenterItems.forEach((items) => {
  //   checks.push(createSoapRequestBody(items));
  // });
  orderItems.forEach((items) => {
    checks.push(createSoapRequestBody(items, orderItems, orderInformations));
  });

  return checks;
};

const createSoapRequestBody = (items, orderItems, orderInformations) => {
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
                  orderItems[0]["revenue_center"]
                }</CheckRevenueCenterID>
                <CheckSeq>0</CheckSeq>
                <CheckStatusBits>0</CheckStatusBits>
                <CheckTableObjectNum>1</CheckTableObjectNum>
                <PCheckInfoLines>
                    <string>Name: ${orderInformations["customer_name"]}</string>
                    <string>Payment: ${orderInformations["payment_method"]}</string>
                    <string>Number #: ${orderInformations["room_number"]}</string>
                    <string>Amount: ${orderInformations["order_price"]}</string>
                    <string>Schedule: ${orderInformations["schedule_time"]} ${orderInformations["schedule_day"]}</string>
                    <string>Deliver To: ${orderInformations["delivery_location"]}</string>
                    <string>Special Instructions: ${orderInformations["order_instruction"]}</string>
                    <string>Room Service Menu:</string>
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

  orderItems.forEach((item) => {
    // const additionalInfo = JSON.parse(item.selected_additions);
    // log.info(additionalInfo);
    const itemXml = `<MenuItem>
        <ItemDiscount>
            <DiscObjectNum>0</DiscObjectNum>
        </ItemDiscount>
        <MiObjectNum>${item["item_object_number"]}</MiObjectNum>
        <MiQuantity>${item["quantity"]}</MiQuantity>
        <MiOverridePrice>${item["total_price"]}</MiOverridePrice>
        <MiReference>${item["instructions"]}</MiReference>
        <MiWeight />
    </MenuItem>`;

    requestBodyPart2 = requestBodyPart2 + itemXml;
  });

  return requestBodyPart1 + requestBodyPart2 + requestBodyPart3;
};

// Create XML Soap request for retrieving list of revenue centers
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

// Create XML Soap request for retrieving list of menu items
const createGetMenuItemsRequestBody = (reveueCenter) => {
  return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetConfigurationInfo xmlns="http://localhost:8080/EGateway/">
      <vendorCode />
      <employeeObjectNum>${employeeObjectNum}</employeeObjectNum>
      <configurationInfoType>
        <int>13</int>
      </configurationInfoType>
      <revenueCenter>${reveueCenter}</revenueCenter>
      <configInfoResponse />
    </GetConfigurationInfo>
  </soap:Body>
</soap:Envelope>`;
};

module.exports = {
  createNewCheckRequestBody,
  createGetRevenueCenterRequestBody,
  createGetMenuItemsRequestBody,
};
