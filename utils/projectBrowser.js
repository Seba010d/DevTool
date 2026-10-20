const fs = require("fs");
const path = require("path");
const { input } = require("@inquirer/prompts");

const isProject = require("./projectDetector");
const scanProjects = require("./projectScanner");
const projectActions = require("./projectActions");
const { drawHeader, drawSection, drawInfoPanel, getWidth, truncateText, info, error } = require("./ui");
const { colors } = require("./colors");
const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");
const { drawKeybindings, renderChoiceList, moveSelection, isBackKey } = require("./menu");

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

function getProjectDetailFields(entry) {
  if (!entry) return [];

  if (entry.type === "project") {
    const config = loadProjectConfig(entry.path);
    return [
      ["Name", entry.name],
      ["Type", entry.projectType || "Project"],
      ["Template", config?.template || "Imported or unspecified"],
      ["Run command", config?.run || "Not set"],
      ["Location", entry.path],
    ];
  }

  let children = [];
  try {
    children = getEntries(entry.path);
  } catch {}
  const projects = children.filter((child) => child.type === "project").length;
  return [
    ["Kind", "Folder"],
    ["Projects", String(projects)],
    ["Subfolders", String(children.length - projects)],
    ["Location", entry.path],
  ];
}

function renderProjectDetails(entry, currentPath) {
  console.log("");
  if (!entry) {
    drawInfoPanel("FOLDER DETAILS", [
      ["Status", "No projects or folders here yet"],
      ["Next", "Create a project from the main menu"],
      ["Location", currentPath],
    ]);
    return;
  }

  drawInfoPanel(entry.type === "project" ? "SELECTED PROJECT" : "SELECTED FOLDER", getProjectDetailFields(entry));
}

function renderBreadcrumb(startPath, currentPath) {
  const relativePath = path.relative(startPath, currentPath);
  const breadcrumb = ["Projects", ...(relativePath ? relativePath.split(path.sep) : [])].join("  ›  ");
  console.log(`  ${colors.gray}LOCATION${colors.reset} ${colors.brightCyan}${truncateText(breadcrumb, getWidth() - 13)}${colors.reset}`);
}

function renderProjectList(startPath, currentPath, entries, selectedIndex) {
  clearScreen();

  drawHeader("DEVTOOL", `Projects · ${path.relative(process.env.HOME || "", currentPath) || currentPath}`);
  renderBreadcrumb(startPath, currentPath);
  const projectCount = entries.filter((entry) => entry.type === "project").length;
  const folderCount = entries.length - projectCount;
  renderChoiceList({
    section: `PROJECTS · ${projectCount} PROJECTS · ${folderCount} FOLDERS`,
    choices: entries.map((entry) => ({ name: entry.name, icon: entry.icon, meta: entry.projectType || (entry.type === "folder" ? "Folder" : "Project"), value: entry.path })),
    selectedIndex,
    emptyMessage: "Nothing here yet. Create a project from the main menu.",
    reservedRows: 8,
  });
  renderProjectDetails(entries[selectedIndex], currentPath);

  drawKeybindings("↑↓ Move    Enter Open    / Search    Q Back");
}

async function searchProjects(startPath) {
  disableKeyboard();

  clearScreen();

  drawHeader("DEVTOOL", "Search projects");

  drawSection("SEARCH");
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
    renderChoiceList({
      section: `RESULTS · "${query}"`,
      choices: entries.map((entry) => ({ name: entry.name, icon: entry.icon, meta: entry.projectType || "Project", value: entry.path })),
      selectedIndex,
      reservedRows: 8,
    });
    renderProjectDetails(entries[selectedIndex], startPath);

    drawKeybindings("↑↓ Move    Enter Open    Q Back");

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
      let entries;
      try {
        entries = getEntries(currentPath);
      } catch (errorObject) {
        clearScreen();
        drawHeader("DEVTOOL", "Projects unavailable");
        error(`Could not read ${currentPath}: ${errorObject.message}`);
        drawKeybindings("Press any key to return");
        await waitForKey();
        return;
      }

      let selectedIndex = 0;

      while (true) {
        renderProjectList(startPath, currentPath, entries, selectedIndex);

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
