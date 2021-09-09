const { app, Menu, Tray } = require("electron");
const AutoLaunch = require("auto-launch");
const unhandled = require("electron-unhandled");
const path = require("path");
const { sendRequest } = require("./classes/SymphonyClient");
const { deepStreamPing } = require("./classes/DeepstreamClient");

unhandled();

const autoLauncher = new AutoLaunch({
  name: "Saba Proxy",
});

autoLauncher
  .isEnabled()
  .then((isEnabled) => {
    if (isEnabled) {
      return;
    }
    autoLauncher.enable();
  })
  .catch((err) => {
    throw err;
  });

let tray = null;
app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, "assets/avatar.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Request",
      click: function () {
        sendRequest();
      },
    },
    {
      label: "DeepStream",
      click: function () {
        deepStreamPing();
      },
    },
    {
      label: "Item3",
      click: function () {
        console.log("Clicked on settings");
      },
    },
    {
      label: "Exit",
      click: function () {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);
});
