const Pusher = require("pusher");

const pusher = () => {
  if (!window.__saba_pusher_instance__) {
    window.__saba_pusher_instance__ = new Pusher(process.env.PUSHER_APP_KEY, {
      cluster: process.env.PUSHER_APP_CLUSTER,
      authEndpoint: `https://saba.local.com/api/v1/auth/private-channel`,
      auth: {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Authorization: authHeader(),
        },
      },
    });
  }
  return window.__saba_pusher_instance__;
};

export default pusher;
