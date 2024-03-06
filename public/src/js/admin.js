const menuEl = document.querySelectorAll(".menu-box");
const menuItems = document.querySelectorAll(".menu-item");
const menuContainer = document.querySelector(".menu-container");
const btnClose = document.querySelector(".btn-close");
const views = document.querySelectorAll(".admin-view-page");
const loader = document.querySelectorAll(".loader");
let membersContainer = document.querySelector(".member-profile");
let membersViewEl = document.querySelector(".members-view");
const searchButton = document.querySelector('input[type="search"]');
let paymentButtons = document.getElementsByClassName("btn-add-payment");
const formFilter = document.querySelector(".form-filter");
const btnGenerateprofile = document.querySelector(".btn-filter");
const bkgEl = document.querySelector(".bkg.hide");
const membersProfileContainer = document.querySelector(".members-profile");

const btnPrint = document.querySelector(".btn-print-profiles");
const membersProfileEl = document.querySelector(".members-profile-view");
let selectedMenu = 1;

const openAndCloseMenu = function (state = "hide") {
  if (state === "hide") menuContainer.classList.add("hide");
  else if (state === "show") menuContainer.classList.remove("hide");
};

const renderMembers = function (data) {
  if (data.length < 1) {
    return `<h3>No member found :)</h3>`;
  } else {
    return data
      .map(
        (member) =>
          `<div class="member" data-id="${member.id}">
                <div class="details-container">
                  <img
                    src="/${member.photo}"
                    alt="${member.name.split(" ")[0]}'s photo}"
                    class="member-picture"
                  />
                  <h2 class="name">T/Dr. ${member.name}</h2>
                </div>
                <div class="buttons-container">
                ${
                  member.verified
                    ? ""
                    : `<button class="btn btn-verify-number">Verify member</button
                  >`
                }
                  <button class="btn btn-add-payment">Add Payment</button
                  >
                  ${
                    Date.now() > Date.parse(member.idExpiry) / 1000
                      ? '<button class="btn btn-renew-id">Renew Id</button>'
                      : ""
                  }
                  <button class="btn btn-delete-user">Delete user</button>
                </div>
              </div>`
      )
      .join("");
  }
};
const clearInsertHtml = function (container, html) {
  container.innerHTML = " ";

  container.innerHTML = html;
};

const displaySelectedView = function (selected = 1) {
  let viewOriginalHtml = ``;
  let mainView = "";
  views.forEach((view) => {
    if (view === views[selected]) {
      view.classList.remove("hide");
      mainView = view.querySelector(".main-view");
      viewOriginalHtml = mainView.innerHTML;
      mainView.innerHTML = `<span class="loader"></span>`;
    } else {
      view.classList.add("hide");
    }
  });
  setTimeout(() => {
    mainView.innerHTML = "";
    mainView.innerHTML = viewOriginalHtml;
    views[selected].classList.remove("hide");
  }, 1000);
};

const loadMembers = async function (memberName = "") {
  try {
    let res = "";
    if (memberName !== "" && memberName !== " ")
      res = await fetch(`/api/v1/admin/457/member?name=${memberName}`);
    else res = await fetch(`/api/v1/admin/457/member`);

    const resData = await res.json();
    const { data: members } = resData;

    const htmlStr = renderMembers(members);
    clearInsertHtml(membersContainer, htmlStr);
    paymentButtons = membersContainer.getElementsByClassName("btn-add-payment");

    // membersContainer.innerHTML = " ";
    // membersContainer.insertAdjacentHTML("afterbegin", htmlStr);
    return members;
  } catch (err) {
    // console.log(err);
  }
};

// Showing first view
displaySelectedView(0);
loadMembers();

menuEl.forEach((menuBox) => {
  menuBox.addEventListener("click", function (e) {
    e.preventDefault();
    openAndCloseMenu("show");
  });
});
// closing the menu
btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  openAndCloseMenu("hide");
});
// Adding eventListener to the menu items
menuItems.forEach((menuItem, ind) => {
  menuItem.addEventListener("click", function (e) {
    e.preventDefault();
    const clicked = e.target.closest(".menu-item");

    if (clicked === menuItem) selectedMenu = ind;
    displaySelectedView(selectedMenu);
    openAndCloseMenu("hide");
  });
});

// Searching for a user
searchButton.addEventListener("search", async function (e) {
  membersContainer.innerHTML = " ";
  const members = await loadMembers(this.value);
  const htmlStr = renderMembers(members);
  membersViewEl.innerHTML = `<span class="loader"></span>`;
  setTimeout(() => {
    clearInsertHtml(
      membersViewEl,
      `<div class="member-profile">${htmlStr}</div>`
    );
    paymentButtons = membersContainer.getElementsByClassName("btn-add-payment");
  }, 1000);
});

const makeRequest = async function (reqURL, data, method) {
  try {
    const reqOptions = {
      method,
    };
    if (method === "POST") {
      reqOptions.body = JSON.stringify(data);
      reqOptions.headers = {
        "Content-Type": "application/json",
      };
    } else {
      reqOptions.headers = {
        "Content-Type": "html/text",
      };
    }
    const res = await fetch(reqURL, reqOptions);
    const resData = res.json();
    if (resData.status === "failed") throw resData;
    return resData;
  } catch (err) {
    throw err;
  }
};
membersViewEl.addEventListener("click", async function (e) {
  try {
    let obj = {};
    let htmlString = `
    <div class="holder-container">
      <form  class="verify-member-form" >
              <h3 class="caption">Verify User</h3>
              <div class="dop-box box" style="display:none;">
                <label for="annkId">Name:</label>
                <input type="text" name="annkId" id="annkId" value="%%annkId%%" readonly="true">
              </div>
              <div class="dop-box box">
                <label for="name">Name:</label>
                <input type="text" name="name" id="name" value="%%name%%" readonly="true">
              </div>
              
              <div class="dop-box box">
                <label for="duesDate">Dues Month:</label>
                <input type="date" name="datePaid" id="duesDate">
              </div>
              <div class="dop-box box">
                <label for="amount">Amount:</label>
                <input type="number" name="amount" id="amount" placeholder="Enter amount">
              </div>
              <div class="submit-box">
                <button class="btn-verify">Add payment</button>
              </div>
            </form>
    </div>
    `;
    if (e.target.closest(".member")) {
      if (e.target.closest(".btn-add-payment")) {
        bkgEl.classList.remove("hide");
        bkgEl.innerHTML = " ";
        const member = e.target.closest(".member");
        const { id } = member.dataset;
        const memberName = member.querySelector(".name").textContent;
        htmlString = htmlString.replace("%%name%%", memberName);
        htmlString = htmlString.replace(`%%annkId%%`, id);
        bkgEl.innerHTML = htmlString;
      }
      // obj = {
      //   annkId: id,
      //   paymentType: "dues",
      //   datePaid: "04/25/2022",
      //   amount: 10,
      //   name: memberName,
      // };

      // const data = await makeRequest("/api/v1/pay", obj, "POST");
    }
  } catch (err) {
    // console.log(err);
  }
});

bkgEl.addEventListener("click", async function (e) {
  const clicked = e.target;
  const paymentForm = bkgEl.querySelector(".verify-member-form");
  if (paymentForm)
    paymentForm.addEventListener(
      "submit",
      function (e) {
        e.preventDefault();
      },
      false
    );
  if (e.target.closest(".btn-verify")) {
    const data = Object.fromEntries([...new FormData(paymentForm)]);
    // console.log(data);

    const resData = await makeRequest("/api/v1/pay", data, "POST");
    clearInsertHtml(bkgEl, `<span class="loader"></span>`);
    setTimeout(() => {
      clearInsertHtml(bkgEl, `<h3>${resData.message}</h3>`);
    }, 2000);
  }

  // if (clicked.closest(".bkg")) this.classList.add("hide");
});

// Filtering member with fields
btnGenerateprofile.addEventListener("click", async function (e) {
  e.preventDefault();
  const data = Object.fromEntries([...new FormData(formFilter)]);

  const queryField = Object.entries(data).join("&").replaceAll(",", "=");

  const url = `/api/v1/admin/65d037f009dd7305b2568222/member?${queryField}`;
  const resData = await makeRequest(url, null, "GET");
  let profileHtml = `
  
          <span class="loader hide"></span>
          <div class="prints-view">
           
            <div class="member-profile-print">
              <div id="profile-print-area" class="profiles-header style:"margin-bottom:38px;">
                <header class="profile-header" style="display:flex;flex-direction:column; align-items:center;justify-content:center;">
                  <img style="width:100px; position: absolute; top:5px;left:40px;" src="/src/images/AANk logo.png" alt="" />
                  <img style="width:100px; position: absolute; top:5px;right:40px;" src="/src/images/AANk logo.png" alt="" />
                  <h2 class="company-name">AHABA NDURO NKABOM KUO</h2>
                  <h3 class="company-name">(ANNK)</h3>
                  <h3 class="company-name">BONO EAST - GHANA</h3>
                  <h3 class="company-name">${resData.caption}</h3>
                </header>
                <div class="members-container">
                  %%members%%
                </div>
              </div>
              <div class="print"><button>print profiles</button></div>
            </div>
          </div>
       
  `;

  let membersHtml = "";
  const { data: members } = resData;
  if (members.length > 0)
    membersHtml = members
      .map((member) => {
        const propNames = Object.keys(member);
        return propNames
          .map((name) => {
            if (name === "photo")
              return `<img src="/${member.photo}" alt="" style="position:absolute; top:5px;right:10px;width:60px;"/>`;
            else if (name === "idExpiry")
              return `<h3>
              <span>ID Expiry: </span>
              <span> ${Intl.DateTimeFormat("en-GH", {
                dateStyle: "full",
              }).format(new Date(member.idExpiry))}</span>
            </h3>`;
            else if (name === "verified" || name === "id" || name === "_id")
              return ``;
            else if (name === "name")
              return `<h3>
              <span>Name: </span>
              <span> ${member.name}</span>
            </h3>`;
            else if (name === "phoneNumber")
              return `<h3>
              <span>Phone number: </span>
              <span> ${member.phoneNumber}</span>
            </h3>`;
            else if (name === "companyName")
              return `<h3>
              <span>Company name: </span>
              <span> ${member.companyName}</span>
            </h3>`;
            else if (name === "position")
              return `<h3>
              <span>Position: </span>
              <span> ${member.position}</span>
            </h3>`;
            else
              return `<h3>
            <span>${name}: </span>
            <span> ${member[name]}</span>
          </h3>`;
          })
          .join("");
      })
      .map(
        (string) => `
        <div class="member-box" style="margin-bottom:10px;position:relative;">
                ${string}    
        </div>
      `
      )
      .join(" ");
  else membersHtml = `<h3>No members found</h3>`;

  profileHtml = profileHtml.replace("%%members%%", membersHtml);
  clearInsertHtml(membersProfileEl, profileHtml);
  // console.log(resData);
});

membersProfileEl.addEventListener("click", function (e) {
  const clicked = e.target;
  if (clicked.closest(".print")) {
    try {
      printJS({
        printable: "profile-print-area",
        type: "html",
        targetStyles: ["*"],
        css: `
        .prints-view .member-profile-print .profile-header {
  background-color: rgba(164, 255, 141, 0.349);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.prints-view .member-profile-print .profile-header h2 {
  font-size: 2.8rem;
}
.prints-view .member-profile-print .profile-header img {
  width: 6.8rem;
  position: absolute;
  top: 0;
}
.prints-view .member-profile-print .profile-header img:nth-child(1) {
  left: 15%;
}
.prints-view .member-profile-print .profile-header img:nth-child(2) {
  right: 15%;
}
.prints-view .member-profile-print .members-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  gap: 0.4rem;
}
.prints-view .member-profile-print .members-container .member-box {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 0.4rem;
  height: 20rem;
}
.prints-view .member-profile-print .members-container .member-box h3 {
  display: grid;
  grid-template-columns: 2fr 8fr;
  gap: 1rem;
  font-size: 1.8rem;
}
.prints-view .member-profile-print .members-container .member-box img {
  width: 12rem;
  position: absolute;
  top: 10px;
  right: 50px;
  outline: 2px solid black;
  outline-offset: 5px;
}
.prints-view .member-profile-print .members-container .member-box:nth-child(odd) {
  background-color: rgba(128, 128, 128, 0.068);
}
.prints-view .member-profile-print .members-container .member-box:nth-child(even) {
  background-color: rgba(183, 255, 165, 0.068);
}
.prints-view .print button {
  padding: 0.4rem 0.8rem;
  font-weight: 700;
}
        `,
      });
    } catch (err) {
      // console.log(err);
    }
  }
});

const imgs = document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", function (e) {
    img.src = "/src/images/male avatar.jpg";
  });
});
