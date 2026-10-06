const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");
const isProject = require("./projectDetector");
const scanProjects = require("./projectScanner");
const projectActions = require("./projectActions");

function loadProjectConfig(projectPath) {
  const configPath = path.join(projectPath, ".devtool.json");

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return null;
  }
}

async function browseProjects(startPath) {
  let currentPath = startPath;

  while (true) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));

    const choices = entries.map((entry) => {
      const entryPath = path.join(currentPath, entry.name);
      const project = isProject(entryPath);
      const config = project ? loadProjectConfig(entryPath) : null;

      let name = `${project ? "📦" : "📁"} ${entry.name}`;

      if (config?.projectType) {
        name += ` (${config.projectType})`;
      }

      return {
        name,
        value: {
          type: project ? "project" : "folder",
          path: entryPath,
        },
      };
    });

    if (currentPath === startPath) {
      choices.unshift({
        name: "Search projects",
        value: { type: "search" },
      });

      choices.push({
        name: "← Back to main menu",
        value: { type: "main" },
      });
    } else {
      choices.push({
        name: "← Go back",
        value: { type: "back" },
      });
    }

    const selected = await select({
      message: `Current folder: ${currentPath}`,
      choices,
      loop: false,
    });

    if (selected.type === "search") {
      const query = (
        await input({
          message: "Search project name:",
        })
      )
        .trim()
        .toLowerCase();

      if (!query) continue;

      const matches = scanProjects(startPath).filter((projectPath) => path.basename(projectPath).toLowerCase().includes(query));

      if (!matches.length) {
        console.log("No matching projects found.");
        continue;
      }

      const found = await select({
        message: "Search results:",
        choices: [
          ...matches.map((projectPath) => {
            const config = loadProjectConfig(projectPath);

            let name = `📦 ${path.basename(projectPath)}`;

            if (config?.projectType) {
              name += ` (${config.projectType})`;
            }

            return {
              name,
              value: projectPath,
            };
          }),
          {
            name: "← Back",
            value: null,
          },
        ],
        loop: false,
      });

      if (found) {
        await projectActions(found);
      }

      continue;
    }

    if (selected.type === "project") {
      await projectActions(selected.path);
      continue;
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
