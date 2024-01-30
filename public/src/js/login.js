const loginForm = document.querySelector(".login-form");
const btnLogin = document.querySelector(".btn-login");

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
});
