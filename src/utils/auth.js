const keytar = require("keytar");

const authHeader = async () => {
  const token = await keytar.getPassword("login", "access_token");

  return `Bearer ${token}`;
};

module.exports = { authHeader };
