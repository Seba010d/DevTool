const fs = require("fs");
const path = require("path");
const { input } = require("@inquirer/prompts");

const isProject = require("./projectDetector");
const scanProjects = require("./projectScanner");
const projectActions = require("./projectActions");
const { drawHeader, info } = require("./ui");

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

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function disableRawMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }

  process.stdin.pause();

  process.stdout.write("\x1b[?25h");
}

function enableRawMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdout.write("\x1b[?25l");
}

function waitForKey() {
  return new Promise((resolve) => {
    let buffer = "";

    const onData = (data) => {
      buffer += data;

      if (buffer === "\u001b") {
        setTimeout(() => {
          if (buffer === "\u001b") {
            process.stdin.removeListener("data", onData);

            resolve("escape");
          }
        }, 50);

        return;
      }

      if (buffer.startsWith("\u001b[")) {
        if (buffer.endsWith("A")) {
          process.stdin.removeListener("data", onData);

          resolve("up");
          return;
        }

        if (buffer.endsWith("B")) {
          process.stdin.removeListener("data", onData);

          resolve("down");
          return;
        }
      }

      if (buffer === "\r" || buffer === "\n") {
        process.stdin.removeListener("data", onData);

        resolve("enter");
        return;
      }

      if (buffer === "/") {
        process.stdin.removeListener("data", onData);

        resolve("search");
        return;
      }

      if (buffer === "q" || buffer === "Q") {
        process.stdin.removeListener("data", onData);

        resolve("back");
        return;
      }

      if (buffer.length === 1) {
        process.stdin.removeListener("data", onData);

        resolve(buffer);
      }
    };

    process.stdin.on("data", onData);
  });
}

function renderEntry(entry, selected) {
  const pointer = selected ? "❯" : " ";

  const left = `${pointer}  ${entry.icon}  ${entry.name}`;

  if (!entry.projectType) {
    return left;
  }

  const nameColumnWidth = 34;

  const spacing = Math.max(2, nameColumnWidth - left.length);

  return `${left}${" ".repeat(spacing)}${entry.projectType}`;
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

  console.log("");

  console.log("─".repeat(Math.min(Math.max(process.stdout.columns || 80, 60), 90)));

  console.log("");

  console.log("  ↑↓ Navigate    Enter Select    / Search    Q Back");
}

async function searchProjects(startPath) {
  disableRawMode();

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
    enableRawMode();
    return;
  }

  const matches = scanProjects(startPath).filter((projectPath) => path.basename(projectPath).toLowerCase().includes(query));

  if (!matches.length) {
    clearScreen();

    drawHeader("DEVTOOL", "Search");

    info(`No projects matching "${query}" were found.`);

    console.log("");
    console.log("  Press any key to continue...");

    enableRawMode();

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

  enableRawMode();

  let selectedIndex = 0;

  while (true) {
    clearScreen();

    drawHeader("DEVTOOL", `Search · ${entries.length} result${entries.length === 1 ? "" : "s"}`);

    console.log(`  RESULTS · "${query}"`);

    console.log("");

    entries.forEach((entry, index) => {
      console.log(renderEntry(entry, index === selectedIndex));
    });

    console.log("");

    console.log("─".repeat(Math.min(Math.max(process.stdout.columns || 80, 60), 90)));

    console.log("");

    console.log("  ↑↓ Navigate    Enter Select    Q Back");

    const key = await waitForKey();

    if (key === "up") {
      if (selectedIndex > 0) {
        selectedIndex--;
      }

      continue;
    }

    if (key === "down") {
      if (selectedIndex < entries.length - 1) {
        selectedIndex++;
      }

      continue;
    }

    if (key === "enter") {
      disableRawMode();

      await projectActions(entries[selectedIndex].path);

      enableRawMode();

      return;
    }

    if (key === "back" || key === "escape") {
      return;
    }
  }
}

async function browseProjects(startPath) {
  let currentPath = startPath;

  enableRawMode();

  try {
    while (true) {
      const entries = getEntries(currentPath);

      let selectedIndex = 0;

      while (true) {
        renderProjectList(currentPath, entries, selectedIndex);

        const key = await waitForKey();

        if (key === "up") {
          if (selectedIndex > 0) {
            selectedIndex--;
          }

          continue;
        }

        if (key === "down") {
          if (selectedIndex < entries.length - 1) {
            selectedIndex++;
          }

          continue;
        }

        if (key === "enter") {
          if (!entries.length) {
            continue;
          }

          const selected = entries[selectedIndex];

          if (selected.type === "project") {
            disableRawMode();

            await projectActions(selected.path);

            enableRawMode();

            break;
          }

          if (selected.type === "folder") {
            currentPath = selected.path;

            break;
          }
        }

        if (key === "search") {
          await searchProjects(startPath);

          enableRawMode();

          break;
        }

        if (key === "back") {
          if (currentPath === startPath) {
            return;
          }

          currentPath = path.dirname(currentPath);

          break;
        }

        if (key === "escape") {
          if (currentPath === startPath) {
            return;
          }

          currentPath = path.dirname(currentPath);

          break;
        }
      }
    }
  } finally {
    disableRawMode();
  }
}

module.exports = browseProjects;
