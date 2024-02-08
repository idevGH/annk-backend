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
  messageEl.scrollIntoView({ scroll: "smooth" });
};

// Adding close button listener
if (btnClose)
  btnClose.addEventListener("click", function (e) {
    displayMessage("", false);
  });
/////////////////////////////////
const slides = document.querySelectorAll(".slide");
const tabsContainer = document.querySelector(".dashboard-area-header-menu");

let currSlide = 0;
// Translating the various slides
const translateSlides = function (currentSlide) {
  slides.forEach((slide, ind) => {
    slide.style.transform = `translateX(${(ind - currSlide) * 105}%)`;
    // console.log(ind);
  });
};
translateSlides(currSlide);

// Adding a click handler to the various tabs
tabsContainer.addEventListener("click", function (e) {
  const clickedTab = e.target.closest(".dashboard-area-header-menu-item");
  const tabItems = Array.from(this.children);
  if (clickedTab) {
    tabItems.forEach((menuItem, ind) => {
      menuItem.classList.remove("selected");
      currSlide = menuItem === clickedTab ? ind : currSlide;
    });
    clickedTab.classList.add("selected");
    translateSlides(currSlide);
  }
});

///////////////////////////////////////////
var paymentForm = document.getElementById("paymentForm");
function payWithPaystack(e) {
  e.preventDefault();
  try {
    var handler = PaystackPop.setup({
      key: "pk_live_1fa9582d8f37c198c069b96b28fd5ad74dd29cbb", // Replace with your public key
      // email: document.getElementById("email-address").value,
      // amount: document.getElementById("amount").value * 100, // the amount value is multiplied by 100 to convert to the lowest currency unit
      email: `kwakhuh@gmail.com`,
      amount: 0.5 * 100, // the amount value is multiplied by 100 to convert to the lowest currency unit
      currency: "GHS", // Use GHS for Ghana Cedis or USD for US Dollars
      // ref: "YOUR_REFERENCE", // Replace with a reference you generated
      callback: function (response) {
        //this happens after the payment is completed successfully
        var reference = response.reference;
        alert("Payment complete! Reference: " + reference);
        // Make an AJAX call to your server with the reference to verify the transaction
        fetch("https://webhook.site/be36098a-859c-401b-95a0-c9e4c32e642c", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
          })
          .catch((err) => {
            console.log(err);
          });
      },
      onClose: function () {
        displayMessage("Payment of dues was cancelled.", true, "failed");
      },
    });
    handler.openIframe();
  } catch (err) {
    displayMessage(
      "Please make sure your phone has internet to make payment.",
      true,
      "failed"
    );
    console.log(err);
  }
}

paymentForm.addEventListener("submit", payWithPaystack, false);
