javascript
const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    if (email && password) {
        window.location.href = "./dashboard.html";
    }
});
