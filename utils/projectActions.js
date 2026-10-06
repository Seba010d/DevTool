const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");
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

async function openMenu(projectPath) {
  while (true) {
    console.clear();

    drawHeader("DEVTOOL / OPEN", path.basename(projectPath));

    console.log("  OPEN PROJECT");
    console.log("");

    const choice = await select({
      message: "Open with:",
      choices: [
        {
          name: "💻  VS Code",
          value: "code",
        },
        {
          name: "📂  Finder",
          value: "finder",
        },
        {
          name: "⌨️  Ghostty",
          value: "terminal",
        },
        {
          name: "←   Back",
          value: "back",
        },
      ],
      loop: false,
    });

    if (choice === "back") {
      return;
    }

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

      continue;
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

      continue;
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
  }
}

async function runMenu(projectPath) {
  while (true) {
    console.clear();

    drawHeader("DEVTOOL / RUN", path.basename(projectPath));

    console.log("  PROJECT");
    console.log("");

    const hasPackage = fs.existsSync(path.join(projectPath, "package.json"));

    const choices = [
      {
        name: "▶   Run project",
        value: "run",
      },
    ];

    if (hasPackage) {
      choices.push({
        name: "📥  Install dependencies",
        value: "install",
      });
    }

    choices.push({
      name: "←   Back",
      value: "back",
    });

    const choice = await select({
      message: "Select:",
      choices,
      loop: false,
    });

    if (choice === "back") {
      return;
    }

    if (choice === "run") {
      runProject(projectPath);

      await input({
        message: "Press Enter to continue",
      });
    }

    if (choice === "install") {
      console.clear();

      drawHeader("DEVTOOL / INSTALL", path.basename(projectPath));

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
  }
}

async function showProjectInfo(projectPath) {
  const config = getProjectConfig(projectPath);

  console.clear();

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
}

async function renameProject(projectPath) {
  const oldName = path.basename(projectPath);

  console.clear();

  drawHeader("DEVTOOL / RENAME", oldName);

  const newName = (
    await input({
      message: "New project name:",
      default: oldName,
    })
  ).trim();

  if (!newName || newName === oldName) {
    return projectPath;
  }

  const newPath = path.join(path.dirname(projectPath), newName);

  if (fs.existsSync(newPath)) {
    error(`A project named "${newName}" already exists.`);

    await input({
      message: "Press Enter to continue",
    });

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

  return newPath;
}

async function moveProject(projectPath) {
  console.clear();

  drawHeader("DEVTOOL / MOVE", path.basename(projectPath));

  const config = loadConfig();

  const destination = await chooseFolder(config.projectsLocation);

  if (!destination) {
    return projectPath;
  }

  const newPath = path.join(destination, path.basename(projectPath));

  if (fs.existsSync(newPath)) {
    error("A project with this name already exists there.");

    await input({
      message: "Press Enter to continue",
    });

    return projectPath;
  }

  fs.renameSync(projectPath, newPath);

  success(`Moved ${path.basename(projectPath)}.`);

  await input({
    message: "Press Enter to continue",
  });

  return newPath;
}

async function deleteProject(projectPath) {
  console.clear();

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

  return true;
}

async function manageMenu(projectPath) {
  while (true) {
    console.clear();

    drawHeader("DEVTOOL / MANAGE", path.basename(projectPath));

    console.log("  MANAGEMENT");
    console.log("");

    const choice = await select({
      message: "Select:",
      choices: [
        {
          name: "ℹ   Project information",
          value: "info",
        },
        {
          name: "✏   Rename project",
          value: "rename",
        },
        {
          name: "📦  Move project",
          value: "move",
        },
        {
          name: "🗑   Delete project",
          value: "delete",
        },
        {
          name: "←   Back",
          value: "back",
        },
      ],
      loop: false,
    });

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
}

async function projectActions(projectPath) {
  addRecentProject(projectPath);

  while (true) {
    console.clear();

    drawHeader("DEVTOOL / PROJECT", path.basename(projectPath));

    console.log("  ACTIONS");
    console.log("");

    const choice = await select({
      message: "What do you want to do?",
      choices: [
        {
          name: "📂  Open",
          value: "open",
        },
        {
          name: "▶   Run",
          value: "run",
        },
        {
          name: "🔧  Manage",
          value: "manage",
        },
        {
          name: "←   Back",
          value: "back",
        },
      ],
      loop: false,
    });

    if (choice === "back") {
      return;
    }

    if (choice === "open") {
      await openMenu(projectPath);
    }

    if (choice === "run") {
      await runMenu(projectPath);
    }

    if (choice === "manage") {
      const result = await manageMenu(projectPath);

      if (result.deleted) {
        return;
      }

      projectPath = result.path;
    }
  }
}

module.exports = projectActions;
