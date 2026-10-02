const fs = require("fs");
const path = require("path");

function isProject(folderPath) {
  const configPath = path.join(folderPath, ".devtool.json");

  return fs.existsSync(configPath);
}

module.exports = isProject;
