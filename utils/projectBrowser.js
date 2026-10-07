const fs = require("fs");
const path = require("path");
const { input } = require("@inquirer/prompts");

const isProject = require("./projectDetector");
const scanProjects = require("./projectScanner");
const projectActions = require("./projectActions");
const { drawHeader, info } = require("./ui");
const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");
const { drawKeybindings, renderChoice, getDisplayWidth, moveSelection, isBackKey } = require("./menu");

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

function getProjectType(projectPath) {
  const config = loadProjectConfig(projectPath);

  if (!config) {
    return null;
  }

  switch (config.projectType) {
    case "node":
      return "Node.js";

    case "express":
      return "Node.js";

    case "web":
      return "Web";

    case "javascript":
      return "JavaScript";

    case "boilerplate":
      return "Project";

    case "empty":
      return "Project";

    default:
      return "Project";
  }
}

function getEntries(currentPath) {
  return fs
    .readdirSync(currentPath, {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => {
      const entryPath = path.join(currentPath, entry.name);

      const project = isProject(entryPath);

      return {
        name: entry.name,
        path: entryPath,
        type: project ? "project" : "folder",
        icon: project ? "📦" : "📁",
        projectType: project ? getProjectType(entryPath) : null,
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      }),
    );
}

function renderEntry(entry, selected) {
  const choice = {
    name: entry.name,
    icon: entry.icon,
  };

  const line = renderChoice(choice, selected);

  if (!entry.projectType) {
    return line;
  }

  const typeColumn = 38;
  const lineWidth = getDisplayWidth(line);
  const spacing = Math.max(4, typeColumn - lineWidth);

  return line + " ".repeat(spacing) + entry.projectType;
}

function renderProjectList(currentPath, entries, selectedIndex) {
  clearScreen();

  drawHeader("DEVTOOL", `Projects · ${path.relative(process.env.HOME || "", currentPath) || currentPath}`);

  console.log("  PROJECTS");
  console.log("");

  if (!entries.length) {
    console.log("  No projects or folders found.");
    console.log("");
  }

  entries.forEach((entry, index) => {
    console.log(renderEntry(entry, index === selectedIndex));
  });

  drawKeybindings();
}

async function searchProjects(startPath) {
  disableKeyboard();

  clearScreen();

  drawHeader("DEVTOOL", "Search projects");

  console.log("  SEARCH");
  console.log("");

  const query = (
    await input({
      message: "Project name:",
    })
  )
    .trim()
    .toLowerCase();

  if (!query) {
    enableKeyboard();
    return;
  }

  const matches = scanProjects(startPath).filter((projectPath) => path.basename(projectPath).toLowerCase().includes(query));

  if (!matches.length) {
    clearScreen();

    drawHeader("DEVTOOL", "Search");

    info(`No projects matching "${query}" were found.`);

    console.log("");
    console.log("  Press any key to continue...");

    enableKeyboard();

    await waitForKey();

    return;
  }

  const entries = matches.map((projectPath) => ({
    name: path.basename(projectPath),
    path: projectPath,
    type: "project",
    icon: "📦",
    projectType: getProjectType(projectPath),
  }));

  enableKeyboard();

  let selectedIndex = 0;

  while (true) {
    clearScreen();

    drawHeader("DEVTOOL", `Search · ${entries.length} result${entries.length === 1 ? "" : "s"}`);

    console.log(`  RESULTS · "${query}"`);
    console.log("");

    entries.forEach((entry, index) => {
      console.log(renderEntry(entry, index === selectedIndex));
    });

    drawKeybindings();

    const key = await waitForKey();

    if (key.name === "up") {
      selectedIndex = moveSelection(selectedIndex, "up", entries.length);

      continue;
    }

    if (key.name === "down") {
      selectedIndex = moveSelection(selectedIndex, "down", entries.length);

      continue;
    }

    if (isBackKey(key)) {
      return;
    }

    if (key.name === "return") {
      disableKeyboard();

      await projectActions(entries[selectedIndex].path);

      enableKeyboard();

      return;
    }
  }
}

async function browseProjects(startPath) {
  let currentPath = startPath;

  enableKeyboard();

  try {
    while (true) {
      const entries = getEntries(currentPath);

      let selectedIndex = 0;

      while (true) {
        renderProjectList(currentPath, entries, selectedIndex);

        const key = await waitForKey();

        if (key.name === "up") {
          selectedIndex = moveSelection(selectedIndex, "up", entries.length);

          continue;
        }

        if (key.name === "down") {
          selectedIndex = moveSelection(selectedIndex, "down", entries.length);

          continue;
        }

        if (isBackKey(key)) {
          if (currentPath === startPath) {
            return;
          }

          currentPath = path.dirname(currentPath);

          break;
        }

        if (key.name === "return") {
          if (!entries.length) {
            continue;
          }

          const selected = entries[selectedIndex];

          if (selected.type === "project") {
            disableKeyboard();

            await projectActions(selected.path);

            enableKeyboard();

            break;
          }

          if (selected.type === "folder") {
            currentPath = selected.path;
            break;
          }
        }

        if (key.name === "/") {
          await searchProjects(startPath);

          enableKeyboard();

          break;
        }
      }
    }
  } finally {
    disableKeyboard();
  }
}

module.exports = browseProjects;
