const { ipcRenderer } = require("electron");
const psl = require("psl");

const validURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

document.getElementById("loginForm").onsubmit = function (event) {
  event.preventDefault();
  const responseBlock = document.getElementById("response-block");

  const inputUsername = document.getElementById("username");
  const inputPassword = document.getElementById("password");
  const inputHotel = document.getElementById("hotel");

  const username = inputUsername.value;
  const password = inputPassword.value;
  let hotel = inputHotel.value;
  // only allowed domains can be accessed
  let originName = "";

  const allowedDomains = [
    "guest-chat.com",
    "guestlinq.com",
    "staynchat.com",
    "chatbothotels.com",
  ];

  if(validURL(hotel)) {
    let domain = (new URL(hotel));
    hotel = domain.origin;
    let parsed = psl.parse(domain.hostname);
    originName = parsed.domain;
  }

  if(allowedDomains.includes(originName)) {
    ipcRenderer.sendSync("login_submit", {
      username,
      password,
      hotel,
    });
  
    ipcRenderer.on("success", (event, args) => {
      responseBlock.classList.remove("login-error");
      responseBlock.classList.add("login-success");
      responseBlock.innerHTML = args;
  
      inputUsername.value = '';
      inputPassword.value = '';
      inputHotel.value = '';
    });
  
    ipcRenderer.on("error", (event, args) => {
      responseBlock.classList.remove("login-success");
      responseBlock.classList.add("login-error");
      responseBlock.innerHTML = args;
  
      inputUsername.value = '';
      inputPassword.value = '';
      inputHotel.value = '';
    });
  } else {
    responseBlock.classList.remove("login-success");
    responseBlock.classList.add("login-error");
    responseBlock.innerHTML = "domain is not allowed";
  }
};
