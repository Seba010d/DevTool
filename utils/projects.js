const fs = require("fs");
const path = require("path");
const isProject = require("./projectDetector");

function getProjects(projectLocation) {
  return fs
    .readdirSync(projectLocation, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .filter((entry) => {
      const folderPath = path.join(projectLocation, entry.name);

      return isProject(folderPath);
    })
    .map((entry) => ({
      name: entry.name,
      path: path.join(projectLocation, entry.name),
    }));
}

module.exports = getProjects;
