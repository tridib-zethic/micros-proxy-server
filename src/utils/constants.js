const keytar = require("keytar");

const hotelDashboardURL = async () => {
  const hotel = await keytar.getPassword("login", "hotel");

  return hotel;
};

module.exports = {
  pusherAppId: "8ff0572d6882103f1606",
  pusherCluster: "ap1",
  hotelDashboardURL,
};
