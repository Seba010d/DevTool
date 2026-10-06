const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");
const { execFile, spawn } = require("child_process");

const chooseFolder = require("./folderBrowser");
const runProject = require("./projectRunner");

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
    if (err) console.log(`Could not open ${app}: ${err.message}`);
  });
}

async function openMenu(projectPath) {
  while (true) {
    const choice = await select({
      message: "Open:",
      choices: [
        { name: "Open in VS Code", value: "vscode" },
        { name: "Open in Finder", value: "finder" },
        { name: "Open in Ghostty", value: "terminal" },
        { name: "← Go back", value: "back" },
      ],
      loop: false,
    });

    if (choice === "back") return;

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

    const choices = [
      {
        name: config?.run ? `Run project (${config.run})` : "Run project",
        value: "run",
      },
      ...(fs.existsSync(path.join(projectPath, "package.json")) ? [{ name: "Install dependencies", value: "install" }] : []),
      { name: "← Go back", value: "back" },
    ];

    const choice = await select({
      message: "Run:",
      choices,
      loop: false,
    });

    if (choice === "back") return;

    if (choice === "run") {
      runProject(projectPath);
    }

    if (choice === "install") {
      const child = spawn("npm", ["install"], {
        cwd: projectPath,
        stdio: "inherit",
      });

      await new Promise((resolve) =>
        child.on("close", (code) => {
          console.log(code === 0 ? "\nDependencies installed." : `\nnpm install exited with code ${code}.`);

          resolve();
        }),
      );

      await input({ message: "Press Enter to continue" });
    }
  }
}

async function manageMenu(projectPath) {
  while (true) {
    const choice = await select({
      message: "Manage:",
      choices: [
        { name: "Project information", value: "info" },
        { name: "Rename project", value: "rename" },
        { name: "Move project", value: "move" },
        { name: "Delete project", value: "delete" },
        { name: "← Go back", value: "back" },
      ],
      loop: false,
    });

    if (choice === "back") return;

    if (choice === "info") {
      let pkg = {};
      const meta = loadProjectConfig(projectPath) || {};

      try {
        pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));
      } catch {}

      const projectName = path.basename(projectPath);
      const dependencies = Object.keys(pkg.dependencies || {});
      const devDependencies = Object.keys(pkg.devDependencies || {});

      console.log("");
      console.log(`Name: ${meta.name || projectName}`);
      console.log(`Type: ${meta.projectType || meta.type || "Unknown"}`);
      console.log(`Template: ${meta.template || "Unknown"}`);
      console.log(`Created: ${meta.created || "Unknown"}`);
      console.log(`Run: ${meta.run || "Not configured"}`);
      console.log(`Dependencies: ${dependencies.length ? dependencies.join(", ") : "None"}`);
      console.log(`Dev dependencies: ${devDependencies.length ? devDependencies.join(", ") : "None"}`);
      console.log("");

      await input({ message: "Press Enter to continue" });
    }

    if (choice === "rename") {
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
        console.log("That name already exists.");
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

      projectPath = destination;
    }

    if (choice === "move") {
      const projectName = path.basename(projectPath);
      const currentParent = path.dirname(projectPath);

      console.log("");

      const newLocation = await chooseFolder(currentParent);

      if (!newLocation) {
        continue;
      }

      if (newLocation === currentParent) {
        console.log("\nProject is already in that folder.");
        continue;
      }

      const destination = path.join(newLocation, projectName);

      if (fs.existsSync(destination)) {
        console.log(`\nA project named "${projectName}" already exists there.`);
        continue;
      }

      fs.renameSync(projectPath, destination);
      projectPath = destination;

      console.log(`\nProject moved to: ${projectPath}`);
    }

    if (choice === "delete") {
      const projectName = path.basename(projectPath);

      const confirmation = await select({
        message: `Delete "${projectName}"?`,
        choices: [
          { name: "Yes, delete project", value: "yes" },
          { name: "No, cancel", value: "no" },
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

      console.log("");
      console.log(`Project deleted: ${projectName}`);
      console.log("");

      return "deleted";
    }
  }
}

async function projectActions(projectPath) {
  while (true) {
    const projectName = path.basename(projectPath);
    const config = loadProjectConfig(projectPath);

    const action = await select({
      message: `What do you want to do with ${projectName}?`,
      choices: [
        { name: "Open", value: "open" },
        {
          name: config?.run ? `Run (${config.run})` : "Run",
          value: "run",
        },
        { name: "Manage", value: "manage" },
        { name: "← Go back", value: "back" },
      ],
      loop: false,
    });

    if (action === "back") return;

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
