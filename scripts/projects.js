javascript id="x2j9qk"
const searchInput = document.querySelector('input[placeholder="Search anything..."]');
const projectColumns = document.querySelectorAll(".grid > div");

searchInput.addEventListener("input", function () {
    const searchText = this.value.toLowerCase();

    projectColumns.forEach((column) => {
        const text = column.textContent.toLowerCase();

        if (text.includes(searchText)) {
            column.style.display = "";
        } else {
            column.style.display = "none";
        }
    });
});
