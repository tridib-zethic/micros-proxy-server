const keytar = require("keytar");

const authHeader = async () => {
  const token = await keytar.getPassword("login", "access_token");

  return `Bearer ${token}`;
};

const authRefreshToken = async () => {
  const refresh_token = await keytar.getPassword("login", "refresh_token");
  return refresh_token;
}

module.exports = { authHeader, authRefreshToken };
