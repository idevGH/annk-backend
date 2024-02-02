const formEl = document.querySelector(".personal-signup-form");
const photoEl = document.querySelector('input[name="photo"');
const imgEl = document.querySelector(".new-image");
const btnClose = document.querySelector(".close");
const messageContainer = document.querySelector(".message-container");
const messageEl = document.querySelector(".message");
const messageBKG = document.querySelector(".message-bkg");

photoEl.addEventListener("change", function (e) {
  e.preventDefault();
  const fileReader = new FileReader();

  fileReader.addEventListener("load", function (e) {
    imgEl.setAttribute("src", `${this.result}`);
  });
  fileReader.readAsDataURL(this.files[0]);
});

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

if (btnClose)
  btnClose.addEventListener("click", function (e) {
    displayMessage("", false);
  });
formEl.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formDataArr = new FormData(this);
  const data = [...formDataArr];

  const formData = new FormData();
  //   deleting the photo property if === undefined
  const ind = data.findIndex((el) => el[0] === "photo");
  data.splice(ind, 1);
  //   Appending the various property name with its values on the FormData Obj
  data.forEach((propertyName) => {
    formData.append(`${propertyName[0]}`, `${propertyName[1]}`);
  });

  //   Appending the photo property if any
  if (document.querySelector('input[name="photo"').files[0] !== undefined)
    formData.append(
      "photo",
      document.querySelector('input[name="photo"').files[0]
    );
  //  Making a post request to save the member
  const res = await fetch("/api/v1/member/register", {
    method: "post",
    body: formData,
  });

  const resData = await res.json();
  if (resData.status === "success")
    location.assign(
      `http://127.0.0.1:8090/member/${resData.data.newMember._id}`
    );
  else {
    displayMessage(resData.message, true, resData.status);
  }
  console.log(resData);
});
