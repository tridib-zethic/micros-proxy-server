const { app, Menu, Tray, BrowserWindow } = require("electron");
const AutoLaunch = require("auto-launch");
const unhandled = require("electron-unhandled");
const path = require("path");
const { parseXml, openCheque } = require("./classes/SymphonyClient");
const { login } = require("./classes/SabaApiClient");
const { ipcMain } = require("electron");
const log = require("electron-log");
const keytar = require("keytar");
const { pusher } = require("./classes/PusherClient");

unhandled();

const autoLauncher = new AutoLaunch({
  name: "Saba Proxy",
});

// push.connection.bind("error", function (err) {
//   log.error(err.error);
// });
// log.info(pusher);

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

pusher();

let tray = null;
app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, "assets/avatar.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Request",
      click: function () {
        // sendRequest();
        openCheque();
      },
    },
    {
      label: "Saba Login Api",
      click: function () {
        // login();
        const win = new BrowserWindow({
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
          },
        });

        win.loadFile(path.join(__dirname, "pages/login.html"));
      },
    },
    {
      label: "Pusher Test",
      click: async function () {
        pusher().then((push) => {
          const channel = push.subscribe("pos");
          // log.error(push);
          channel.bind("pusher:subscription_succeeded", function (status) {
            // Yipee!!
            log.info("Hello");
          });

          channel.bind("pusher:subscription_error", function (status) {
            log.error(status);
          });

          channel.bind("request_created", (data) => {
            log.info(data);
          });
        });
      },
    },
    {
      label: "Parse Xml",
      click: function () {
        parseXml();
      },
    },
    {
      label: "Test",
      click: async function () {
        const pass = await keytar.getPassword("login", "access_token");
        log.error(pass);
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

ipcMain.on("login_submit", (event, arg) => {
  login(arg);

  event.returnValue = true;
});
