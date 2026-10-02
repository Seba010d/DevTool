const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts");
const isProject = require("./projectDetector");
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
