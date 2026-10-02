const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts");
const isProject = require("./projectDetector");
const scanProjects = require("./projectScanner");
const { input } = require("@inquirer/prompts");
const projectActions = require("./projectActions");

async function browseProjects(startPath) {
  let currentPath = startPath;

  while (true) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));

    const choices = entries.map((entry) => {
      const entryPath = path.join(currentPath, entry.name);

      if (isProject(entryPath)) {
        return {
          name: `📦 ${entry.name} — ${entryPath}`,
          value: {
            type: "project",
            path: entryPath,
          },
        };
      }

      return {
        name: `📁 ${entry.name}`,
        value: {
          type: "folder",
          path: entryPath,
        },
      };
    });

    if (currentPath === startPath) {
      choices.unshift({ name: "Search projects", value: { type: "search" } });
      choices.push({
        name: "← Back to main menu",
        value: {
          type: "main",
        },
      });
    } else {
      choices.push({
        name: "← Go back",
        value: {
          type: "back",
        },
      });
    }

    const selected = await select({
      message: `Current folder: ${currentPath}`,
      choices,
      loop: false,
    });

    if (selected.type === "search") {
      const query = (await input({ message: "Search project name:" })).trim().toLowerCase();
      if (!query) continue;
      const matches = scanProjects(startPath).filter((p) => path.basename(p).toLowerCase().includes(query));
      if (!matches.length) {
        console.log("No matching projects found.");
        continue;
      }
      const found = await select({ message: "Search results:", choices: [...matches.map((p) => ({ name: `📦 ${path.basename(p)} — ${p}`, value: p })), { name: "← Back", value: null }], loop: false });
      if (found) {
        await projectActions(found);
        return;
      }
      continue;
    }
    if (selected.type === "project") {
      await projectActions(selected.path);

      return;
    }

    if (selected.type === "main") {
      return;
    }

    if (selected.type === "back") {
      currentPath = path.dirname(currentPath);
      continue;
    }

    if (selected.type === "folder") {
      currentPath = selected.path;
    }
  }
}

module.exports = browseProjects;
