javascript
const signupForm = document.querySelector("form");

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    window.location.href = "./dashboard.html";
});
