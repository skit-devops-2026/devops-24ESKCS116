javascript
// Login button
document.querySelectorAll("button").forEach((button) => {
    if (button.textContent.trim() === "Log in") {
        button.addEventListener("click", () => {
            window.location.href = "./login.html";
        });
    }
});

// Get Started buttons
document.querySelectorAll("button").forEach((button) => {
    if (button.textContent.trim() === "Get Started") {
        button.addEventListener("click", () => {
            window.location.href = "./signup.html";
        });
    }
});

// Learn More button
document.querySelectorAll("button").forEach((button) => {
    if (button.textContent.trim() === "Learn More") {
        button.addEventListener("click", () => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });
        });
    }
});
