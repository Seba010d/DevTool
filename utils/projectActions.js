// utils/projectActions.js
const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");
const { execFile, spawn } = require("child_process");
const runProject = require("./projectRunner");

function openApp(app, args, cwd) {
  execFile(app, args, { cwd }, (err) => {
    if (err) console.log(`Could not open ${app}: ${err.message}`);
  });
}

async function projectActions(projectPath) {
  while (true) {
    const projectName = path.basename(projectPath);

    const actions = [{ name: "Open in VS Code", value: "vscode" }, { name: "Open in Finder", value: "finder" }, { name: "Open in Ghostty", value: "terminal" }, { name: "Run project", value: "run" }, ...(fs.existsSync(path.join(projectPath, "package.json")) ? [{ name: "Install dependencies", value: "install" }] : []), { name: "Project information", value: "info" }, { name: "Rename project", value: "rename" }, { name: "Delete project", value: "delete" }, { name: "← Go back", value: "back" }];

    const action = await select({
      message: `What do you want to do with ${projectName}?`,
      choices: actions,
      loop: false,
    });

    if (action === "back") return;

    if (action === "finder") {
      openApp("open", [projectPath], projectPath);
    }

    if (action === "vscode") {
      openApp("code", [projectPath], projectPath);
    }

    if (action === "terminal") {
      openApp("open", ["-a", "Ghostty", projectPath], projectPath);
    }

    if (action === "run") {
      runProject(projectPath);
    }

    if (action === "info") {
      let pkg = {};
      let meta = {};

      try {
        pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));
      } catch {}

      try {
        meta = JSON.parse(fs.readFileSync(path.join(projectPath, ".devtool.json"), "utf8"));
      } catch {}

      const dependencies = Object.keys(pkg.dependencies || {});

      console.log(`\nName: ${projectName}\nTemplate: ${meta.template || "Unknown"}\nDependencies: ${dependencies.length ? dependencies.join(", ") : "None listed"}\n`);

      await input({ message: "Press Enter to continue" });
    }

    if (action === "install") {
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

    if (action === "rename") {
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
      projectPath = destination;
    }

    if (action === "delete") {
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

      return;
    }
  }
}

module.exports = projectActions;
