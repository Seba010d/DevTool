const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");
const { execFile, spawn } = require("child_process");

const chooseFolder = require("./folderBrowser");
const runProject = require("./projectRunner");
const { addRecentProject, removeRecentProject, updateRecentProject } = require("./config");
const { drawHeader, success, error, info } = require("./ui");

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

function openApp(app, args, cwd) {
  execFile(app, args, { cwd }, (err) => {
    if (err) {
      error(`Could not open ${app}: ${err.message}`);
    }
  });
}

async function openMenu(projectPath) {
  while (true) {
    console.clear();

    drawHeader("DEVTOOL / OPEN", path.basename(projectPath));

    const choice = await select({
      message: "Open:",
      choices: [
        {
          name: "Open in VS Code",
          value: "vscode",
        },
        {
          name: "Open in Finder",
          value: "finder",
        },
        {
          name: "Open in Ghostty",
          value: "terminal",
        },
        {
          name: "← Go back",
          value: "back",
        },
      ],
      loop: false,
    });

    if (choice === "back") {
      return;
    }

    if (choice === "finder") {
      openApp("open", [projectPath], projectPath);
    }

    if (choice === "vscode") {
      openApp("code", [projectPath], projectPath);
    }

    if (choice === "terminal") {
      openApp("open", ["-a", "Ghostty", projectPath], projectPath);
    }
  }
}

async function runMenu(projectPath) {
  while (true) {
    const config = loadProjectConfig(projectPath);

    console.clear();

    drawHeader("DEVTOOL / RUN", path.basename(projectPath));

    const choices = [
      {
        name: config?.run ? `Run project  ${config.run}` : "Run project",
        value: "run",
      },
    ];

    if (fs.existsSync(path.join(projectPath, "package.json"))) {
      choices.push({
        name: "Install dependencies",
        value: "install",
      });
    }

    choices.push({
      name: "← Go back",
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
      continue;
    }

    if (choice === "install") {
      console.log("");

      const child = spawn("npm", ["install"], {
        cwd: projectPath,
        stdio: "inherit",
      });

      await new Promise((resolve) =>
        child.on("close", (code) => {
          console.log("");

          if (code === 0) {
            success("Dependencies installed.");
          } else {
            error(`npm install exited with code ${code}.`);
          }

          resolve();
        }),
      );

      await input({ message: "Press Enter to continue" });
    }
  }
}

async function manageMenu(projectPath) {
  while (true) {
    console.clear();

    drawHeader("DEVTOOL / MANAGE", path.basename(projectPath));

    const choice = await select({
      message: "Manage:",
      choices: [
        {
          name: "Project information",
          value: "info",
        },
        {
          name: "Rename project",
          value: "rename",
        },
        {
          name: "Move project",
          value: "move",
        },
        {
          name: "Delete project",
          value: "delete",
        },
        {
          name: "← Go back",
          value: "back",
        },
      ],
      loop: false,
    });

    if (choice === "back") {
      return;
    }

    if (choice === "info") {
      let pkg = {};
      const meta = loadProjectConfig(projectPath) || {};

      try {
        pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));
      } catch {}

      const projectName = path.basename(projectPath);
      const dependencies = Object.keys(pkg.dependencies || {});
      const devDependencies = Object.keys(pkg.devDependencies || {});

      console.clear();

      drawHeader("DEVTOOL / PROJECT INFO", projectName);

      console.log(`${info("Name")}        ${meta.name || projectName}`);
      console.log(`${info("Type")}        ${meta.projectType || meta.type || "Unknown"}`);
      console.log(`${info("Template")}    ${meta.template || "Unknown"}`);
      console.log(`${info("Created")}     ${meta.created || "Unknown"}`);
      console.log(`${info("Run")}         ${meta.run || "Not configured"}`);
      console.log(`${info("Dependencies")} ${dependencies.length ? dependencies.join(", ") : "None"}`);
      console.log(`${info("Dev deps")}    ${devDependencies.length ? devDependencies.join(", ") : "None"}`);

      await input({ message: "Press Enter to continue" });
    }

    if (choice === "rename") {
      const oldPath = projectPath;
      const projectName = path.basename(projectPath);

      const name = (
        await input({
          message: "New project name:",
          default: projectName,
        })
      ).trim();

      if (!name || name === projectName || name === "." || name === ".." || /[\\/]/.test(name)) {
        continue;
      }

      const destination = path.join(path.dirname(projectPath), name);

      if (fs.existsSync(destination)) {
        error("That name already exists.");
        await input({ message: "Press Enter to continue" });
        continue;
      }

      fs.renameSync(projectPath, destination);

      const configPath = path.join(destination, ".devtool.json");

      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

          config.name = name;

          fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
        } catch {}
      }

      updateRecentProject(oldPath, destination);

      projectPath = destination;

      success(`Project renamed to ${name}.`);
    }

    if (choice === "move") {
      const oldPath = projectPath;
      const projectName = path.basename(projectPath);
      const currentParent = path.dirname(projectPath);

      const newLocation = await chooseFolder(currentParent);

      if (!newLocation) {
        continue;
      }

      if (newLocation === currentParent) {
        info("Project is already in that folder.");
        await input({ message: "Press Enter to continue" });
        continue;
      }

      const destination = path.join(newLocation, projectName);

      if (fs.existsSync(destination)) {
        error(`A project named "${projectName}" already exists there.`);
        await input({ message: "Press Enter to continue" });
        continue;
      }

      fs.renameSync(projectPath, destination);

      updateRecentProject(oldPath, destination);

      projectPath = destination;

      success(`Project moved to ${projectPath}.`);
    }

    if (choice === "delete") {
      const projectName = path.basename(projectPath);

      const confirmation = await select({
        message: `Delete "${projectName}"?`,
        choices: [
          {
            name: "Yes, delete project",
            value: "yes",
          },
          {
            name: "No, cancel",
            value: "no",
          },
        ],
        loop: false,
      });

      if (confirmation !== "yes") {
        continue;
      }

      fs.rmSync(projectPath, {
        recursive: true,
        force: true,
      });

      removeRecentProject(projectPath);

      success(`Project deleted: ${projectName}.`);

      return "deleted";
    }
  }
}

async function projectActions(projectPath) {
  addRecentProject(projectPath);

  while (true) {
    const projectName = path.basename(projectPath);
    const config = loadProjectConfig(projectPath);

    console.clear();

    drawHeader(`DEVTOOL / ${projectName.toUpperCase()}`, config?.projectType || "Project");

    const action = await select({
      message: "What do you want to do?",
      choices: [
        {
          name: "Open",
          value: "open",
        },
        {
          name: config?.run ? `Run  ${config.run}` : "Run",
          value: "run",
        },
        {
          name: "Manage",
          value: "manage",
        },
        {
          name: "← Go back",
          value: "back",
        },
      ],
      loop: false,
    });

    if (action === "back") {
      return;
    }

    if (action === "open") {
      await openMenu(projectPath);
    }

    if (action === "run") {
      await runMenu(projectPath);
    }

    if (action === "manage") {
      const result = await manageMenu(projectPath);

      if (result === "deleted") {
        return;
      }
    }
  }
}

module.exports = projectActions;
