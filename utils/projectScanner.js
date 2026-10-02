const fs = require("fs");
const path = require("path");
const isProject = require("./projectDetector");

const ignoredDirectories = new Set([
  ".git", ".hg", ".svn", "node_modules", "bower_components", "vendor",
  "dist", "build", "coverage", ".next", ".nuxt", ".output",
  ".cache", ".expo", "Pods", "DerivedData", "__pycache__",
]);

function scanProjects(folderPath) {
  let entries;
  try {
    entries = fs.readdirSync(folderPath, { withFileTypes: true });
  } catch {
    return [];
  }
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || ignoredDirectories.has(entry.name)) continue;
    const entryPath = path.join(folderPath, entry.name);
    if (isProject(entryPath)) {
      projects.push(entryPath);
      continue;
    }
    projects.push(...scanProjects(entryPath));
  }
  return projects;
}

module.exports = scanProjects;
