const fs = require("fs");
const path = require("path");
const { input, select } = require("@inquirer/prompts");
const { execFile, spawn } = require("child_process");

const chooseFolder = require("./folderBrowser");
const runProject = require("./projectRunner");
const { addRecentProject, loadConfig } = require("./config");
const { drawHeader, success, error, info } = require("./ui");

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

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function disableRawMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }

  process.stdin.pause();
}

function enableRawMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.resume();
  process.stdin.setEncoding("utf8");
}

function waitForKey() {
  return new Promise((resolve) => {
    const onData = (key) => {
      process.stdin.removeListener("data", onData);
      resolve(key);
    };

    process.stdin.on("data", onData);
  });
}

function drawKeybindings(bindings) {
  console.log("");
  console.log("─".repeat(Math.min(Math.max(process.stdout.columns || 80, 60), 90)));
  console.log("");
  console.log(`  ${bindings}`);
}

function renderMenu(title, subtitle, section, choices, selectedIndex, bindings = "↑↓ Navigate    Enter Select    Q Back") {
  clearScreen();

  drawHeader(title, subtitle);

  console.log(`  ${section}`);
  console.log("");

  choices.forEach((choice, index) => {
    const pointer = index === selectedIndex ? "❯" : " ";

    console.log(`${pointer}  ${choice.icon}  ${choice.name}`);
  });

  drawKeybindings(bindings);
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
    {
      name: "Back",
      icon: "←",
      value: "back",
    },
  ];

  let selectedIndex = 0;

  enableRawMode();

  try {
    while (true) {
      renderMenu("DEVTOOL / OPEN", path.basename(projectPath), "OPEN PROJECT", choices, selectedIndex);

      const key = await waitForKey();

      if (key === "\u001b[A") {
        if (selectedIndex > 0) {
          selectedIndex--;
        }

        continue;
      }

      if (key === "\u001b[B") {
        if (selectedIndex < choices.length - 1) {
          selectedIndex++;
        }

        continue;
      }

      if (key === "\r" || key === "\n") {
        const choice = choices[selectedIndex].value;

        if (choice === "back") {
          return;
        }

        disableRawMode();

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

        enableRawMode();
      }

      if (key === "q" || key === "Q" || key === "\u001b") {
        return;
      }
    }
  } finally {
    disableRawMode();
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

  choices.push({
    name: "Back",
    icon: "←",
    value: "back",
  });

  let selectedIndex = 0;

  enableRawMode();

  try {
    while (true) {
      renderMenu("DEVTOOL / RUN", path.basename(projectPath), "PROJECT", choices);

      const key = await waitForKey();

      if (key === "\u001b[A") {
        if (selectedIndex > 0) {
          selectedIndex--;
        }

        continue;
      }

      if (key === "\u001b[B") {
        if (selectedIndex < choices.length - 1) {
          selectedIndex++;
        }

        continue;
      }

      if (key === "\r" || key === "\n") {
        const choice = choices[selectedIndex].value;

        if (choice === "back") {
          return;
        }

        disableRawMode();

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

        enableRawMode();
      }

      if (key === "q" || key === "Q" || key === "\u001b") {
        return;
      }
    }
  } finally {
    disableRawMode();
  }
}

async function showProjectInfo(projectPath) {
  const config = getProjectConfig(projectPath);

  disableRawMode();

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

  await input({
    message: "Press Enter to continue",
  });

  enableRawMode();
}

async function renameProject(projectPath) {
  disableRawMode();

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
    enableRawMode();
    return projectPath;
  }

  const newPath = path.join(path.dirname(projectPath), newName);

  if (fs.existsSync(newPath)) {
    error(`A project named "${newName}" already exists.`);

    await input({
      message: "Press Enter to continue",
    });

    enableRawMode();

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

  enableRawMode();

  return newPath;
}

async function moveProject(projectPath) {
  disableRawMode();

  clearScreen();

  drawHeader("DEVTOOL / MOVE", path.basename(projectPath));

  const config = loadConfig();

  const destination = await chooseFolder(config.projectsLocation);

  if (!destination) {
    enableRawMode();
    return projectPath;
  }

  const newPath = path.join(destination, path.basename(projectPath));

  if (fs.existsSync(newPath)) {
    error("A project with this name already exists there.");

    await input({
      message: "Press Enter to continue",
    });

    enableRawMode();

    return projectPath;
  }

  fs.renameSync(projectPath, newPath);

  success(`Moved ${path.basename(projectPath)}.`);

  await input({
    message: "Press Enter to continue",
  });

  enableRawMode();

  return newPath;
}

async function deleteProject(projectPath) {
  disableRawMode();

  clearScreen();

  drawHeader("DEVTOOL / DELETE", path.basename(projectPath));

  error("This will permanently delete the project.");

  console.log("");

  const confirmation = await select({
    message: "Are you sure?",
    choices: [
      {
        name: "Delete project",
        value: true,
      },
      {
        name: "Cancel",
        value: false,
      },
    ],
    loop: false,
  });

  if (!confirmation) {
    enableRawMode();
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

  enableRawMode();

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
    {
      name: "Back",
      icon: "←",
      value: "back",
    },
  ];

  let selectedIndex = 0;

  enableRawMode();

  try {
    while (true) {
      renderMenu("DEVTOOL / MANAGE", path.basename(projectPath), "MANAGEMENT", choices);

      const key = await waitForKey();

      if (key === "\u001b[A") {
        if (selectedIndex > 0) {
          selectedIndex--;
        }

        continue;
      }

      if (key === "\u001b[B") {
        if (selectedIndex < choices.length - 1) {
          selectedIndex++;
        }

        continue;
      }

      if (key === "\r" || key === "\n") {
        const choice = choices[selectedIndex].value;

        if (choice === "back") {
          return {
            path: projectPath,
            deleted: false,
          };
        }

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

      if (key === "q" || key === "Q" || key === "\u001b") {
        return {
          path: projectPath,
          deleted: false,
        };
      }
    }
  } finally {
    disableRawMode();
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
    {
      name: "Back",
      icon: "←",
      value: "back",
    },
  ];

  let selectedIndex = 0;

  enableRawMode();

  try {
    while (true) {
      renderMenu("DEVTOOL / PROJECT", path.basename(projectPath), "ACTIONS", choices);

      const key = await waitForKey();

      if (key === "\u001b[A") {
        if (selectedIndex > 0) {
          selectedIndex--;
        }

        continue;
      }

      if (key === "\u001b[B") {
        if (selectedIndex < choices.length - 1) {
          selectedIndex++;
        }

        continue;
      }

      if (key === "\r" || key === "\n") {
        const choice = choices[selectedIndex].value;

        if (choice === "back") {
          return;
        }

        if (choice === "open") {
          await openMenu(projectPath);
          enableRawMode();
        }

        if (choice === "run") {
          await runMenu(projectPath);
          enableRawMode();
        }

        if (choice === "manage") {
          const result = await manageMenu(projectPath);

          if (result.deleted) {
            return;
          }

          projectPath = result.path;
          enableRawMode();
        }
      }

      if (key === "q" || key === "Q" || key === "\u001b") {
        return;
      }
    }
  } finally {
    disableRawMode();
  }
}

module.exports = projectActions;
