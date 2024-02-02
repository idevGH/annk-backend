const loginForm = document.querySelector(".login-form");
const btnLogin = document.querySelector(".btn-login");
const btnClose = document.querySelector(".close");

const messageContainer = document.querySelector(".message-container");
const messageEl = document.querySelector(".message");
const messageBKG = document.querySelector(".message-bkg");
// Display message function
const displayMessage = function (
  message = null,
  show = false,
  status = "failed"
) {
  const color = status === "success" ? "green" : "red";
  messageEl.textContent = message;
  if (show === true) {
    messageContainer.classList.remove("hide");
    messageContainer.style.backgroundColor = "color";
    messageBKG.classList.remove("hide");
  } else if (show === false) {
    messageContainer.classList.add("hide");
    messageBKG.classList.add("hide");
  }
};

// Adding close button listener
if (btnClose)
  btnClose.addEventListener("click", function (e) {
    displayMessage("", false);
  });

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const data = Object.fromEntries([...new FormData(loginForm)]);
  console.log(JSON.stringify(data));
  const res = await fetch("/api/v1/member/login", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const resData = await res.json();

  console.log(resData);
  if (resData.status === "success")
    location.assign(`http://127.0.0.1:8090/member/${resData.id}`);
  else displayMessage(resData.message, true, resData.status);
});
