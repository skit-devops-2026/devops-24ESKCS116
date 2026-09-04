const fs = require("fs");

const files = [
  "index.html",
  "pages/login.html",
  "pages/signup.html",
  "pages/dashboard.html",
  "pages/projects.html"
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing file: ${file}`);
  }
}

console.log("All required pages exist.");