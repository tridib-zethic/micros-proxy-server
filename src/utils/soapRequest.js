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
    location_name: revenueCenterItems.location_name,
  };
  if(orderItems) {
    let tempOrderItems = {};

    orderItems.forEach((items) => {
      let tempOrderRevenueCenter = items.revenue_center;
      if(!tempOrderItems[tempOrderRevenueCenter]) {
        tempOrderItems[tempOrderRevenueCenter] = [];
      }
      tempOrderItems[tempOrderRevenueCenter].push(items);
    });
    for(objectProperty in tempOrderItems) {
      checks.push(createSoapRequestBody(tempOrderItems, tempOrderItems[objectProperty], orderInformations));
    }
    // tempOrderItems.forEach(el => {
    //   checks.push(createSoapRequestBody(items, el, orderInformations));
    // });

    return checks;
  }
  
};

const createSoapRequestBody = (items, orderItems, orderInformations) => {
  const date = new Date();

  const additionalMainProducts = [];

  const requestBodyPart1 = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
<soap:Body>
  <PostTransactionEx2 xmlns="http://micros-hosting.com/EGateway/">
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
      <PCheckInfoLines>
        <string>Name: ${orderInformations["customer_name"]}</string>
        <string>Payment: ${orderInformations["payment_method"]}</string>
        <string>Number #: ${orderInformations["room_number"]}</string>
        <string>Schedule: ${orderInformations["schedule_time"]} ${
    orderInformations["schedule_day"]
  }</string>
        <string>Deliver To: ${orderInformations["delivery_location"]}</string>
        <string>Taxes: ${orderInformations["taxes"]}</string>
        <string>Service Charge: ${orderInformations["svc"]}</string>
        <string>Tray Charges: ${orderInformations["tray_charges"]}</string>
        <string>Special Instructions: ${
          orderInformations["order_instruction"]
        }</string>
        <string>Room Service Menu:</string>
      </PCheckInfoLines>
      <EventObjectNum>0</EventObjectNum>
    </pGuestCheck>
    <ppMenuItemsEx>`;

  let requestBodyPart2 = "";

  const requestBodyPart3 = `</ppMenuItemsEx>
<ppComboMealsEx />
<pSvcChargeEx>
  <SvcChgObjectNum>0</SvcChgObjectNum>
</pSvcChargeEx>
<pSubTotalDiscountEx />
<pTmedDetailEx2>
  <SimphonyPosApi_TmedDetailItemEx2>
    <TmedEPayment>
      <AccountDataSource>SOURCE_UNDEFINED</AccountDataSource>
      <AccountType>ACCOUNT_TYPE_UNDEFINED</AccountType>
      <ExpirationDate>0001-01-01T00:00:00</ExpirationDate>
      <IssueNumber>0</IssueNumber>
      <PaymentCommand>NO_E_PAYMENT</PaymentCommand>
      <StartDate>0001-01-01T00:00:00</StartDate>
    </TmedEPayment>
    <TmedObjectNum>902</TmedObjectNum>
  </SimphonyPosApi_TmedDetailItemEx2>
</pTmedDetailEx2>
<ppCheckPrintLines>
  <string />
</ppCheckPrintLines>
<ppVoucherOutput>
  <string />
</ppVoucherOutput>
</PostTransactionEx2>
</soap:Body>
</soap:Envelope>`;

  orderItems.forEach((item) => {
    let unique_item_object_number = item["item_object_number"];
    const additionalInfo = JSON.parse(item.selected_additions);
    let total_price = item.total_price;
    let total_quantity = item.quantity;
    let unitPrice = 0.0;
    if (total_price && total_quantity) {
      let tempUnitPrice = total_price / total_quantity;
      if (!isNaN(tempUnitPrice)) {
        unitPrice = parseFloat(tempUnitPrice);
      }
    }
    let productAdditions = [];
    for (let property in additionalInfo) {
      let el = additionalInfo[property];
      if (el?.price_type) {
        let price_type = el.price_type;
        // for replace
        if (price_type == "replace") {
          let options = el.options;
          if(options?.posMenu?.menu_id) {
            unique_item_object_number = options.posMenu.menu_id;
          }
          options.forEach((element) => {
            if (!isNaN(parseFloat(element?.price))) {
              unitPrice = parseFloat(element.price);
            }
          });
        } else {
          let options = el.options;
          options.forEach((element) => {
            if(element?.posMenu?.is_condiment == false) {
              let tempProduct = {
                revenue_center: element?.posMenu?.revenue_center,
                quantity: total_quantity,
                item_object_number: element?.posMenu?.menu_id,
                unit_price: (!isNaN(parseFloat(element?.price))) ? parseFloat(element?.price) : 0.0,
              }
              additionalMainProducts.push(tempProduct);
            } else {
              // for additions
              productAdditions.push({ ...el });
            }
          });
        }
      }
    }

    let itemXml1 = `<SimphonyPosApi_MenuItemEx>
    <Condiments>`;

    let itemXml2 = ``;
    // <MiOverridePrice>${unitPrice}</MiOverridePrice>
    let itemXml3 = `</Condiments>
    <MenuItem>
      <ItemDiscount>
        <SimphonyPosApi_DiscountEx>
          <DiscObjectNum>0</DiscObjectNum>
        </SimphonyPosApi_DiscountEx>
      </ItemDiscount>
      <MiObjectNum>${unique_item_object_number}</MiObjectNum>
      <MiOverridePrice />
      <MiQuantity>${item["quantity"]}</MiQuantity>
      <MiReference>${item["instructions"]}</MiReference>
      <MiWeight />
      <MiMenuLevel>1</MiMenuLevel>
      <MiSubLevel>1</MiSubLevel>
      <MiPriceLevel>0</MiPriceLevel>
      <MiDefinitionSeqNum>1</MiDefinitionSeqNum>
    </MenuItem>
  </SimphonyPosApi_MenuItemEx>`;

    productAdditions.forEach((elementTemporary) => {
      let elementTempOptions = elementTemporary.options;
      // <MiOverridePrice>${elementTemp["price"]}</MiOverridePrice>
      elementTempOptions.forEach((elementTemp) => {
        if(elementTemp["posMenu"]) {
          if(elementTemp["posMenu"]["menu_id"]) {
            let currentTempElement = `<SimphonyPosApi_MenuItemDefinitionEx>
              <ItemDiscount />
              <MiObjectNum>${elementTemp["posMenu"]["menu_id"]}</MiObjectNum>
              <MiOverridePrice />
              <MiQuantity>${item["quantity"]}</MiQuantity>
              <MiReference />
              <MiWeight />
              <MiMenuLevel>1</MiMenuLevel>
              <MiSubLevel>1</MiSubLevel>
              <MiPriceLevel>0</MiPriceLevel>
              <MiDefinitionSeqNum>1</MiDefinitionSeqNum>
              </SimphonyPosApi_MenuItemDefinitionEx>`;

            itemXml2 = itemXml2 + currentTempElement;
          }
        }
      });
    });

    let itemXml = '';
    // <MiOverridePrice>${elementTempOpt['unit_price']}</MiOverridePrice>
    additionalMainProducts.forEach(elementTempOpt => {
      let tempItemXml = `<SimphonyPosApi_MenuItemEx>
        <Condiments/>
        <MenuItem>
          <ItemDiscount>
            <SimphonyPosApi_DiscountEx>
              <DiscObjectNum>0</DiscObjectNum>
            </SimphonyPosApi_DiscountEx>
          </ItemDiscount>
          <MiObjectNum>${elementTempOpt["item_object_number"]}</MiObjectNum>
          <MiOverridePrice />
          <MiQuantity>${item["quantity"]}</MiQuantity>
          <MiReference />
          <MiWeight />
          <MiMenuLevel>1</MiMenuLevel>
          <MiSubLevel>1</MiSubLevel>
          <MiPriceLevel>0</MiPriceLevel>
          <MiDefinitionSeqNum>1</MiDefinitionSeqNum>
        </MenuItem>
      </SimphonyPosApi_MenuItemEx>`;

      itemXml = itemXml + tempItemXml;
    });

    itemXml = itemXml1 + itemXml2 + itemXml3;

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
const createGetMenuItemsRequestBody = (revenueCenter) => {
  return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetConfigurationInfo xmlns="http://localhost:8080/EGateway/">
      <vendorCode />
      <employeeObjectNum>${employeeObjectNum}</employeeObjectNum>
      <configurationInfoType>
        <int>13</int>
      </configurationInfoType>
      <revenueCenter>${revenueCenter}</revenueCenter>
      <configInfoResponse />
    </GetConfigurationInfo>
  </soap:Body>
</soap:Envelope>`;
};

// Create XML Soap request for retrieving list of definitions
const createGetDefinitionsRequestBody = (revenueCenter) => {
  return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetConfigurationInfo xmlns="http://localhost:8080/EGateway/">
      <vendorCode />
      <employeeObjectNum>${employeeObjectNum}</employeeObjectNum>
      <configurationInfoType>
        <int>1</int>
      </configurationInfoType>
      <revenueCenter>${revenueCenter}</revenueCenter>
      <configInfoResponse />
    </GetConfigurationInfo>
  </soap:Body>
</soap:Envelope>`;
};

// Create XML Soap request for retrieving list of price details
const createGetPriceRequestBody = (revenueCenter) => {
  return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetConfigurationInfo xmlns="http://localhost:8080/EGateway/">
      <vendorCode />
      <employeeObjectNum>${employeeObjectNum}</employeeObjectNum>
      <configurationInfoType>
        <int>2</int>
      </configurationInfoType>
      <revenueCenter>${revenueCenter}</revenueCenter>
      <configInfoResponse />
    </GetConfigurationInfo>
  </soap:Body>
</soap:Envelope>`;
};

module.exports = {
  createNewCheckRequestBody,
  createGetRevenueCenterRequestBody,
  createGetMenuItemsRequestBody,
  createGetDefinitionsRequestBody,
  createGetPriceRequestBody,
};
