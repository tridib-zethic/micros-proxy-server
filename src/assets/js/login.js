const { ipcRenderer } = require("electron");
document.getElementById("submit").onclick = function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  console.log(
    ipcRenderer.sendSync("login_submit", {
      username,
      password,
    })
  );
};
