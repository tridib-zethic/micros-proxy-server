const createNewCheckRequestBody = (items) => {
  const employeeObjectNum = `4`;
  const revenueCenter = `11`;
  const date = `2021-10-08T17:03:25`;

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
        <MiObjectNum>${item["item_object_number"]}</MiObjectNum>
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
