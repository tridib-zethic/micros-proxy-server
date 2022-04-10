const { app, Menu, Tray, BrowserWindow } = require("electron");
const AutoLaunch = require("auto-launch");
const unhandled = require("electron-unhandled");
const path = require("path");
const { login } = require("./classes/SabaApiClient");
const { ipcMain } = require("electron");
const { pusher } = require("./classes/PusherClient");

unhandled();

const autoLauncher = new AutoLaunch({
  name: "Saba Micros Integration",
});

let force_quit = false;

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

const pusherClient = pusher();

let win = "";

let tray = null;
app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, "assets/avatar.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Saba Login Api",
      click: function () {
        win = new BrowserWindow({
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nativeWindowOpen: true,
            nodeIntegrationInWorker: true,
          },
          icon: __dirname + "/assets/avatar.png",
        });

        win.loadFile(path.join(__dirname, "pages/login.html"));
      },
    },
    {
      label: "Exit",
      accelerator: "CmdOrCtrl+Q",
      click: function (e) {
        force_quit = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip("SABA Micros Proxy");
  tray.setContextMenu(contextMenu);
});

app.on("ready", function () {
  app.on("before-quit", function (e) {
    if (!force_quit) {
      e.preventDefault();
      win.on("close", function (e) {
        if (!force_quit) {
          e.preventDefault();
          win.hide();
        }
      });
    }
  });
});

ipcMain.on("login_submit", async (event, arg) => {
  await login(arg, pusher, pusherClient, event, win);
});
