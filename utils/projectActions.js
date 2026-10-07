const fs = require("fs");
const path = require("path");
const { input } = require("@inquirer/prompts");
const { execFile, spawn } = require("child_process");

const chooseFolder = require("./folderBrowser");
const runProject = require("./projectRunner");
const { addRecentProject, loadConfig } = require("./config");
const { drawHeader, success, error } = require("./ui");
const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");
const { drawKeybindings, renderMenu, moveSelection, isBackKey } = require("./menu");

function getProjectConfig(projectPath) {
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

async function openMenu(projectPath) {
  const choices = [
    {
      name: "VS Code",
      icon: "💻",
      value: "code",
    },
    {
      name: "Finder",
      icon: "📂",
      value: "finder",
    },
    {
      name: "Ghostty",
      icon: "⌨️",
      value: "terminal",
    },
  ];

  let selectedIndex = 0;

  enableKeyboard();

  try {
    while (true) {
      renderMenu({
        title: "DEVTOOL / OPEN",
        subtitle: path.basename(projectPath),
        section: "OPEN PROJECT",
        choices,
        selectedIndex,
      });

      const key = await waitForKey();

      if (key.name === "up") {
        selectedIndex = moveSelection(selectedIndex, "up", choices.length);

        continue;
      }

      if (key.name === "down") {
        selectedIndex = moveSelection(selectedIndex, "down", choices.length);

        continue;
      }

      if (isBackKey(key)) {
        return;
      }

      if (key.name !== "return") {
        continue;
      }

      const choice = choices[selectedIndex].value;

      disableKeyboard();

      if (choice === "code") {
        execFile("code", [projectPath], (errorObject) => {
          if (errorObject) {
            error("Could not open VS Code.");
          } else {
            success("Opened project in VS Code.");
          }
        });

        await input({
          message: "Press Enter to continue",
        });
      }

      if (choice === "finder") {
        execFile("open", [projectPath], (errorObject) => {
          if (errorObject) {
            error("Could not open Finder.");
          } else {
            success("Opened project in Finder.");
          }
        });

        await input({
          message: "Press Enter to continue",
        });
      }

      if (choice === "terminal") {
        const child = spawn(
          "osascript",
          [
            "-e",
            `tell application "Ghostty"
              activate
              set cfg to new surface configuration
              set initial working directory of cfg to "${projectPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
              new window with configuration cfg
            end tell`,
          ],
          {
            detached: true,
            stdio: "ignore",
          },
        );

        child.unref();

        success("Opened Ghostty.");

        await input({
          message: "Press Enter to continue",
        });
      }

      enableKeyboard();
    }
  } finally {
    disableKeyboard();
  }
}

async function runMenu(projectPath) {
  const hasPackage = fs.existsSync(path.join(projectPath, "package.json"));

  const choices = [
    {
      name: "Run project",
      icon: "▶",
      value: "run",
    },
  ];

  if (hasPackage) {
    choices.push({
      name: "Install dependencies",
      icon: "📥",
      value: "install",
    });
  }

  let selectedIndex = 0;

  enableKeyboard();

  try {
    while (true) {
      renderMenu({
        title: "DEVTOOL / RUN",
        subtitle: path.basename(projectPath),
        section: "PROJECT",
        choices,
        selectedIndex,
      });

      const key = await waitForKey();

      if (key.name === "up") {
        selectedIndex = moveSelection(selectedIndex, "up", choices.length);

        continue;
      }

      if (key.name === "down") {
        selectedIndex = moveSelection(selectedIndex, "down", choices.length);

        continue;
      }

      if (isBackKey(key)) {
        return;
      }

      if (key.name !== "return") {
        continue;
      }

      const choice = choices[selectedIndex].value;

      disableKeyboard();

      if (choice === "run") {
        runProject(projectPath);

        await input({
          message: "Press Enter to continue",
        });
      }

      if (choice === "install") {
        clearScreen();

        drawHeader("DEVTOOL / INSTALL", path.basename(projectPath));

        console.log("  INSTALLING DEPENDENCIES");

        console.log("");

        const child = spawn("npm", ["install"], {
          cwd: projectPath,
          stdio: "inherit",
        });

        await new Promise((resolve) => {
          child.on("close", resolve);
        });

        success("Dependencies installed.");

        await input({
          message: "Press Enter to continue",
        });
      }

      enableKeyboard();
    }
  } finally {
    disableKeyboard();
  }
}

async function showProjectInfo(projectPath) {
  const config = getProjectConfig(projectPath);

  disableKeyboard();

  clearScreen();

  drawHeader("DEVTOOL / INFO", path.basename(projectPath));

  console.log("  PROJECT INFORMATION");

  console.log("");

  console.log(`  Name       ${config?.name || path.basename(projectPath)}`);

  console.log(`  Type       ${config?.projectType || "unknown"}`);

  console.log(`  Template   ${config?.template || "unknown"}`);

  console.log(`  Created    ${config?.created || "unknown"}`);

  console.log(`  Run        ${config?.run || "none"}`);

  console.log("");
  console.log(`  Path       ${projectPath}`);

  drawKeybindings("Enter Continue    Q Back");

  await waitForKey();

  enableKeyboard();
}

async function renameProject(projectPath) {
  disableKeyboard();

  const oldName = path.basename(projectPath);

  clearScreen();

  drawHeader("DEVTOOL / RENAME", oldName);

  const newName = (
    await input({
      message: "New project name:",
      default: oldName,
    })
  ).trim();

  if (!newName || newName === oldName) {
    enableKeyboard();
    return projectPath;
  }

  const newPath = path.join(path.dirname(projectPath), newName);

  if (fs.existsSync(newPath)) {
    error(`A project named "${newName}" already exists.`);

    await input({
      message: "Press Enter to continue",
    });

    enableKeyboard();

    return projectPath;
  }

  fs.renameSync(projectPath, newPath);

  const configPath = path.join(newPath, ".devtool.json");

  if (fs.existsSync(configPath)) {
    const config = getProjectConfig(newPath);

    if (config) {
      config.name = newName;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
    }
  }

  success(`Renamed ${oldName} to ${newName}.`);

  await input({
    message: "Press Enter to continue",
  });

  enableKeyboard();

  return newPath;
}

async function moveProject(projectPath) {
  disableKeyboard();

  clearScreen();

  drawHeader("DEVTOOL / MOVE", path.basename(projectPath));

  const config = loadConfig();

  const destination = await chooseFolder(config.projectsLocation);

  if (!destination) {
    enableKeyboard();
    return projectPath;
  }

  const newPath = path.join(destination, path.basename(projectPath));

  if (fs.existsSync(newPath)) {
    error("A project with this name already exists there.");

    await input({
      message: "Press Enter to continue",
    });

    enableKeyboard();

    return projectPath;
  }

  fs.renameSync(projectPath, newPath);

  success(`Moved ${path.basename(projectPath)}.`);

  await input({
    message: "Press Enter to continue",
  });

  enableKeyboard();

  return newPath;
}

async function deleteProject(projectPath) {
  disableKeyboard();

  clearScreen();

  drawHeader("DEVTOOL / DELETE", path.basename(projectPath));

  error("This will permanently delete the project.");

  console.log("");

  const confirmation = await input({
    message: "Type DELETE to confirm:",
  });

  if (confirmation !== "DELETE") {
    enableKeyboard();
    return false;
  }

  fs.rmSync(projectPath, {
    recursive: true,
    force: true,
  });

  success(`Deleted ${path.basename(projectPath)}.`);

  await input({
    message: "Press Enter to continue",
  });

  enableKeyboard();

  return true;
}

async function manageMenu(projectPath) {
  const choices = [
    {
      name: "Project information",
      icon: "ℹ",
      value: "info",
    },
    {
      name: "Rename project",
      icon: "✏",
      value: "rename",
    },
    {
      name: "Move project",
      icon: "📦",
      value: "move",
    },
    {
      name: "Delete project",
      icon: "🗑",
      value: "delete",
    },
  ];

  let selectedIndex = 0;

  enableKeyboard();

  try {
    while (true) {
      renderMenu({
        title: "DEVTOOL / MANAGE",
        subtitle: path.basename(projectPath),
        section: "MANAGEMENT",
        choices,
        selectedIndex,
      });

      const key = await waitForKey();

      if (key.name === "up") {
        selectedIndex = moveSelection(selectedIndex, "up", choices.length);

        continue;
      }

      if (key.name === "down") {
        selectedIndex = moveSelection(selectedIndex, "down", choices.length);

        continue;
      }

      if (isBackKey(key)) {
        return {
          path: projectPath,
          deleted: false,
        };
      }

      if (key.name !== "return") {
        continue;
      }

      const choice = choices[selectedIndex].value;

      if (choice === "info") {
        await showProjectInfo(projectPath);
      }

      if (choice === "rename") {
        projectPath = await renameProject(projectPath);
      }

      if (choice === "move") {
        projectPath = await moveProject(projectPath);
      }

      if (choice === "delete") {
        const deleted = await deleteProject(projectPath);

        if (deleted) {
          return {
            path: projectPath,
            deleted: true,
          };
        }
      }
    }
  } finally {
    disableKeyboard();
  }
}

async function projectActions(projectPath) {
  addRecentProject(projectPath);

  const choices = [
    {
      name: "Open",
      icon: "📂",
      value: "open",
    },
    {
      name: "Run",
      icon: "▶",
      value: "run",
    },
    {
      name: "Manage",
      icon: "🔧",
      value: "manage",
    },
  ];

  let selectedIndex = 0;

  enableKeyboard();

  try {
    while (true) {
      renderMenu({
        title: "DEVTOOL / PROJECT",
        subtitle: path.basename(projectPath),
        section: "ACTIONS",
        choices,
        selectedIndex,
      });

      const key = await waitForKey();

      if (key.name === "up") {
        selectedIndex = moveSelection(selectedIndex, "up", choices.length);

        continue;
      }

      if (key.name === "down") {
        selectedIndex = moveSelection(selectedIndex, "down", choices.length);

        continue;
      }

      if (isBackKey(key)) {
        return;
      }

      if (key.name !== "return") {
        continue;
      }

      const choice = choices[selectedIndex].value;

      if (choice === "open") {
        await openMenu(projectPath);
        enableKeyboard();
      }

      if (choice === "run") {
        await runMenu(projectPath);
        enableKeyboard();
      }

      if (choice === "manage") {
        const result = await manageMenu(projectPath);

        if (result.deleted) {
          return;
        }

        projectPath = result.path;

        enableKeyboard();
      }
    }
  } finally {
    disableKeyboard();
  }
}

module.exports = projectActions;
