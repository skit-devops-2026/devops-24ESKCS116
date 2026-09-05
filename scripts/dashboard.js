javascript
// Search
const searchInput = document.querySelector('input[placeholder="Search anything..."]');
const activities = document.querySelectorAll(".border-b, .border-b + div");

searchInput.addEventListener("input", function () {
    const searchText = this.value.toLowerCase();

    activities.forEach((item) => {
        const text = item.textContent.toLowerCase();

        item.style.display = text.includes(searchText) ? "" : "none";
    });
});


// Quick Action buttons
const quickButtons = document.querySelectorAll(
    "button"
);

quickButtons.forEach((button) => {
    const text = button.textContent.trim();

    if (
        text === "Create New Project" ||
        text === "Add New Task" ||
        text === "Invite Team Member" ||
        text === "View Reports"
    ) {
        button.addEventListener("click", function () {
            alert(text + " functionality will be added later.");
        });
    }
});
