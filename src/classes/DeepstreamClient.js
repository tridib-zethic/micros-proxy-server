const { DeepstreamClient } = require("@deepstream/client");
const log = require("electron-log");

function deepStreamPing() {
  const client = new DeepstreamClient("localhost:6020/api");
  client.login();

  try {
    const record = client.record.getRecord("test");
    // record.set({ firstname: "Homer", lastname: "Simpson", status: "married" });

    record.whenReady((record) => {
      log.info(record.get());
    });

    // client.record.set({
    //   personalData: {
    //     firstname: "Homer",
    //     lastname: "Simpson",
    //     status: "married",
    //   },
    //   children: ["Bart", "Maggie", "Lisa"],
    // });
    // log.info(record);
  } catch (e) {
    log.error(e);
  }
}

module.exports = { deepStreamPing };
