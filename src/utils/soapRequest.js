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

  // const requestBodyPart1 = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  //   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  //   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  //   <soap:Body>
  //       <PostTransactionEx2 xmlns="http://micros-hosting.com/EGateway/">
  //           <vendorCode />
  //           <pGuestCheck>
  //               <CheckDateToFire>${date.toISOString()}</CheckDateToFire>
  //               <CheckEmployeeObjectNum>${employeeObjectNum}</CheckEmployeeObjectNum>
  //               <CheckGuestCount>0</CheckGuestCount>
  //               <CheckID />
  //               <CheckNum>0</CheckNum>
  //               <CheckOrderType>1</CheckOrderType>
  //               <CheckRevenueCenterID>${
  //                 orderItems[0]["revenue_center"]
  //               }</CheckRevenueCenterID>
  //               <CheckSeq>0</CheckSeq>
  //               <CheckStatusBits>0</CheckStatusBits>
  //               <CheckTableObjectNum>1</CheckTableObjectNum>
  //               <PCheckInfoLines>
  //                   <string>Name: ${orderInformations["customer_name"]}</string>
  //                   <string>Payment: ${orderInformations["payment_method"]}</string>
  //                   <string>Number #: ${orderInformations["room_number"]}</string>
  //                   <string>Amount: ${orderInformations["order_price"]}</string>
  //                   <string>Schedule: ${orderInformations["schedule_time"]} ${orderInformations["schedule_day"]}</string>
  //                   <string>Deliver To: ${orderInformations["delivery_location"]}</string>
  //                   <string>Special Instructions: ${orderInformations["order_instruction"]}</string>
  //                   <string>Room Service Menu:</string>
  //               </PCheckInfoLines>
  //               <EventObjectNum>0</EventObjectNum>
  //           </pGuestCheck>
  //           <ppMenuItemsEx>`;

  let totalOtherCharges = 0;

  let checkInfoLines = `<string />`;

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
      <CheckRevenueCenterID>${orderItems[0]["revenue_center"]}</CheckRevenueCenterID>
      <CheckSeq>0</CheckSeq>
      <CheckStatusBits>0</CheckStatusBits>
      <CheckTableObjectNum>1</CheckTableObjectNum>
      <PCheckInfoLines>
        <string>Name: ${orderInformations["customer_name"]}</string>
        <string>Payment: ${orderInformations["payment_method"]}</string>
        <string>Number #: ${orderInformations["room_number"]}</string>
        <string>Schedule: ${orderInformations["schedule_time"]} ${orderInformations["schedule_day"]}</string>
        <string>Deliver To: ${orderInformations["delivery_location"]}</string>
        <string>Special Instructions: ${orderInformations["order_instruction"]}</string>
        <string>Room Service Menu:</string>
      </PCheckInfoLines>
      <EventObjectNum>0</EventObjectNum>
    </pGuestCheck>
    <ppMenuItemsEx>`;

//-----------------------------------------------//
//     SAMPLE ADDITIONS CODE                     //
//-----------------------------------------------//


{/* <SimphonyPosApi_MenuItemEx>
<Condiments>
  <SimphonyPosApi_MenuItemDefinitionEx>
    <ItemDiscount />
    <MiObjectNum>41103</MiObjectNum>
    <MiOverridePrice />
    <MiQuantity>3</MiQuantity>
    <MiReference />
    <MiWeight />
    <MiMenuLevel>1</MiMenuLevel>
    <MiSubLevel>1</MiSubLevel>
    <MiPriceLevel>0</MiPriceLevel>
    <MiDefinitionSeqNum>1</MiDefinitionSeqNum>
  </SimphonyPosApi_MenuItemDefinitionEx>
</Condiments>
<MenuItem>
  <ItemDiscount>
    <SimphonyPosApi_DiscountEx>
      <DiscObjectNum>0</DiscObjectNum>
    </SimphonyPosApi_DiscountEx>
  </ItemDiscount>
  <MiObjectNum>110004</MiObjectNum>
  <MiOverridePrice />
  <MiQuantity>3</MiQuantity>
  <MiReference />
  <MiWeight />
  <MiMenuLevel>1</MiMenuLevel>
  <MiSubLevel>1</MiSubLevel>
  <MiPriceLevel>0</MiPriceLevel>
  <MiDefinitionSeqNum>1</MiDefinitionSeqNum>
</MenuItem>
</SimphonyPosApi_MenuItemEx> */}

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
<ppCheckPrintLines>`
  + checkInfoLines +
`</ppCheckPrintLines>
<ppVoucherOutput>
  <string />
</ppVoucherOutput>
</PostTransactionEx2>
</soap:Body>
</soap:Envelope>`;

  orderItems.forEach((item) => {
    const additionalInfo = JSON.parse(item.selected_additions);
    let total_price = item.total_price;
    let total_quantity = item.quantity;
    let unitPrice = 0.0;
    if(total_price && total_quantity) {
      let tempUnitPrice = total_price / total_quantity;
      if(!isNaN(tempUnitPrice)) {
        unitPrice = parseFloat(tempUnitPrice);
      }
    }
    let productAdditions = [];
      for(let property in additionalInfo) {
        let el = additionalInfo[property];
        if(el?.price_type) {
          let price_type = el.price_type;
          // log.info('price type', price_type);
          // for replace
          if(price_type == 'replace') {
              let options = el.options;
              // log.info('options', options);
              options.forEach(element => {
                // log.info('inside options', element);
                if(!isNaN(parseFloat(element?.price))) {
                  // log.info('Raw price', element);
                  unitPrice = parseFloat(element.price);
                  // log.info('Parsed price', element.price);
                }
              });
          } else { // for additions
            // log.info('for additions', el);
            productAdditions.push({...el});
          }
        }
      }
    // log.info('Unit Price', unitPrice);
    // log.info('additions', productAdditions);


    // const itemXml = `<SimphonyPosApi_MenuItemEx>
    //   <Condiments />
    //   <MenuItem>
    //     <ItemDiscount>
    //         <DiscObjectNum>0</DiscObjectNum>
    //     </ItemDiscount>
    //     <MiObjectNum>${item["item_object_number"]}</MiObjectNum>
    //     <MiQuantity>${item["quantity"]}</MiQuantity>
    //     <MiOverridePrice>${item["total_price"]}</MiOverridePrice>
    //     <MiReference>${item["instructions"]}</MiReference>
    //     <MiWeight />
    //   </MenuItem>
    // </SimphonyPosApi_MenuItemEx>`;

    let itemXml1 = `<SimphonyPosApi_MenuItemEx>
    <Condiments>`;

    let itemXml2 = ``;

    let itemXml3 = `</Condiments>
    <MenuItem>
      <ItemDiscount>
        <SimphonyPosApi_DiscountEx>
          <DiscObjectNum>0</DiscObjectNum>
        </SimphonyPosApi_DiscountEx>
      </ItemDiscount>
      <MiObjectNum>${item["item_object_number"]}</MiObjectNum>
      <MiOverridePrice>${unitPrice}</MiOverridePrice>
      <MiQuantity>${item["quantity"]}</MiQuantity>
      <MiReference>${item["instructions"]}</MiReference>
      <MiWeight />
      <MiMenuLevel>1</MiMenuLevel>
      <MiSubLevel>1</MiSubLevel>
      <MiPriceLevel>0</MiPriceLevel>
      <MiDefinitionSeqNum>1</MiDefinitionSeqNum>
    </MenuItem>
  </SimphonyPosApi_MenuItemEx>`;

  // <MiObjectNum>199090001</MiObjectNum>
  productAdditions.forEach(elementTemporary => {
    let elementTempOptions = elementTemporary.options;
    if(elementTempOptions?.length > 0) {
      checkInfoLines = checkInfoLines + '<string>Product Additions</string>';
    }
    elementTempOptions.forEach(elementTemp => {
      
      // FIRST REVISION

      // let currentTempElement = `<SimphonyPosApi_MenuItemDefinitionEx>
      // <ItemDiscount />
      // <MiObjectNum>${elementTemp["posMenu"]["menu_id"]}</MiObjectNum>
      // <MiOverridePrice />
      // <MiQuantity>${item["quantity"]}</MiQuantity>
      // <MiReference />
      // <MiWeight />
      // <MiMenuLevel>1</MiMenuLevel>
      // <MiSubLevel>1</MiSubLevel>
      // <MiPriceLevel>0</MiPriceLevel>
      // <MiDefinitionSeqNum>1</MiDefinitionSeqNum>
      // </SimphonyPosApi_MenuItemDefinitionEx>`;

      // SECOND REVISION

      // let currentTempElement = `<SimphonyPosApi_MenuItemEx>
      //   <Condiments />
      //   <MenuItem>
      //     <ItemDiscount>
      //         <DiscObjectNum>0</DiscObjectNum>
      //     </ItemDiscount>
      //     <MiObjectNum>${elementTemp["posMenu"]["menu_id"]}</MiObjectNum>
      //     <MiQuantity>${item["quantity"]}</MiQuantity>
      //     <MiWeight />
      //   </MenuItem>
      // </SimphonyPosApi_MenuItemEx>`;
      let tempOverridePrice = elementTemp["posMenu"]["sequences"][0]['price'];
      let totalTempOverridePrice = tempOverridePrice * item["quantity"];
      let currentTempElement = `<string>${item["quantity"]} x ${elementTemp["posMenu"]["name"]} - @${tempOverridePrice} - ${totalTempOverridePrice}</string>`;
      
      totalOtherCharges = totalOtherCharges + totalTempOverridePrice;

      // itemXml2 = itemXml2 + currentTempElement;
      // requestBodyPart2 = requestBodyPart2 + currentTempElement;
      checkInfoLines = checkInfoLines + currentTempElement;
    });
  });

    let itemXml = itemXml1 + itemXml2 + itemXml3;

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

module.exports = {
  createNewCheckRequestBody,
  createGetRevenueCenterRequestBody,
  createGetMenuItemsRequestBody,
};
