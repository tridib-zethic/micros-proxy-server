const keytar = require("keytar");

const hotelDashboardURL = async () => {
  const hotel = await keytar.getPassword("login", "hotel");

  return hotel;
};

module.exports = {
  pusherAppId: "4b2c0457861dd98fc950",
  pusherCluster: "ap1",
  hotelDashboardURL,
};
