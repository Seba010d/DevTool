const fs = require("fs");
const path = require("path");
const isProject = require("./projectDetector");

function scanProjects(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const entries = fs.readdirSync(folderPath, {
    withFileTypes: true,
  });

  const projects = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) {
      continue;
    }

    const entryPath = path.join(folderPath, entry.name);

    if (isProject(entryPath)) {
      projects.push(entryPath);
      continue;
    }

    const nestedProjects = scanProjects(entryPath);

    projects.push(...nestedProjects);
  }

  return projects;
}

module.exports = scanProjects;
