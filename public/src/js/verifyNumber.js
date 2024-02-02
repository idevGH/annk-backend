const verifyForm = document.querySelector(".verify");
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

if (verifyForm)
  verifyForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const { userid } = this.dataset;
    const data = Object.fromEntries([...new FormData(this)]);

    const reqOptions = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const res = await fetch(
      `http://127.0.0.1:8090/api/v1/member/${userid}/verifyNumber`,
      reqOptions
    );
    const resData = await res.json();
    if (resData.status === "success")
      location.assign(`http://127.0.0.1:8090/member/${userid}`);
    else {
      displayMessage(resData.message, true, resData.status);
    }
    console.log(resData);
  });
