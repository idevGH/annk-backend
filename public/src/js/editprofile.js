const personalUpdateForm = document.querySelector(".personal-update-form");
const imageEl = document.querySelector(".new-image");
const imageInput = document.querySelector(".photoEl");
const passwordForm = document.querySelector(".update-password-form");

// Global variables
const id = personalUpdateForm.dataset.annkid;
// Checking for new Image Load
imageInput.addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.addEventListener("load", function (e) {
    imageEl.src = reader.result;
  });
  reader.readAsDataURL(this.files[0]);
});
////////////////////////////////////
const messageContainer = document.querySelector(".message-container");
const messageEl = document.querySelector(".message");
const messageBKG = document.querySelector(".message-bkg");

const btnClose = document.querySelector(".close");
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
  messageBKG.scrollIntoView({ scroll: "smooth" });
};

// Adding close button listener
if (btnClose)
  btnClose.addEventListener("click", function (e) {
    displayMessage("", false);
  });
/////////////////////////////////

// Updating Member Details
personalUpdateForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData();
  let data = Object.fromEntries([...new FormData(this)]);

  if (data.photo.name === " " || data.photo.name === "")
    delete formData.profilePhoto;

  Object.keys(data).forEach((key) => {
    formData.append(`${key}`, data[`${key}`]);
  });

  const reqOptions = {
    method: "PATCH",
    body: formData,
  };

  const res = await fetch(`/api/v1/member/${id}`, reqOptions);
  const resData = await res.json();

  if (resData.status === "success") {
    displayMessage(resData.message, true, resData.status);

    setTimeout(() => {
      location.reload();
    }, 4000);
  } else {
    window.scrollTo({
      left: 0,
      top: 0,
      scroll: "smooth",
    });
    displayMessage(resData.message, true, resData.status);
  }
});

// Updating Password
passwordForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  // getting data from form
  const data = Object.fromEntries([...new FormData(passwordForm)]);
  // req options
  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  // Making the api request
  const res = await fetch(`/api/v1/member/${id}/updatePassword`, reqOptions);
  // Data from response
  const resData = await res.json();

  if (resData.status === "success") {
    displayMessage(resData.message, true, resData.status);

    setTimeout(() => {
      location.reload();
    }, 4000);
  } else displayMessage(resData.message, true, resData.status);
});
