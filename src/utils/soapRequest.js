const createNewCheckRequestBody = (items) => {
  const employeeObjectNum = `900000092`;
  const revenueCenter = `11`;
  const date = `2019-03-06T17:03:25`;

  const requestBodyPart1 = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <PostTransactionEx xmlns="http://micros-hosting.com/EGateway/">
            <vendorCode />
            <pGuestCheck>
                <CheckDateToFire>${date}</CheckDateToFire>
                <CheckEmployeeObjectNum>${employeeObjectNum}</CheckEmployeeObjectNum>
                <CheckGuestCount>0</CheckGuestCount>
                <CheckID />
                <CheckNum>0</CheckNum>
                <CheckOrderType>1</CheckOrderType>
                <CheckRevenueCenterID>${revenueCenter}</CheckRevenueCenterID>
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

  const requestBodyPart2 = createItemBody(items);

  const requestBodyPart3 = `</SimphonyPosApi_MenuItem>
            </ppMenuItems>
            <ppComboMeals />
            <pServiceChg>
                <SvcChgObjectNum>0</SvcChgObjectNum>
            </pServiceChg>
            <pSubTotalDiscount>
                <DiscObjectNum>0</DiscObjectNum>
            </pSubTotalDiscount>
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

  return requestBodyPart1 + requestBodyPart2 + requestBodyPart3;
};

const createItemBody = (items) => {
  let xml = ``;
  items.forEach((item) => {
    if (item["revenue_center"] == 10) {
      const itemXml = `<MenuItem>
        <ItemDiscount>
            <DiscObjectNum>0</DiscObjectNum>
        </ItemDiscount>
        <MiObjectNum>${item["item_object_number"]}/MiObjectNum>
        <MiOverridePrice />
        <MiReference />
        <MiWeight />
    </MenuItem>`;

      xml = xml + itemXml;
    }
  });

  return xml;
};

module.exports = { createNewCheckRequestBody };
