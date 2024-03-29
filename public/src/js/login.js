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
  let color = status === "success" ? "green" : "red";
  messageEl.textContent = message;
  if (show === true) {
    messageContainer.classList.remove("hide");
    messageContainer.style.backgroundColor = color;
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
  if (window.location.pathname.startsWith("/admin"))
    data.phoneNumber = data.email;
  const url = window.location.pathname.startsWith("/admin")
    ? "/api/v1/admin/login"
    : "/api/v1/member/login";

  const routTo = window.location.pathname.startsWith("/admin")
    ? "/admin/"
    : "/member/";

  const res = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const resData = await res.json();

  if (resData.status === "success") {
    displayMessage(resData.message, true, resData.status);
    setTimeout(() => {
      location.assign(`${routTo}${resData.id}`);
    }, 4000);
  } else displayMessage(resData.message, true, resData.status);
});
