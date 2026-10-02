const fs = require("fs");
const { select, confirm } = require("@inquirer/prompts");
const { exec } = require("child_process");
const runProject = require("./projectRunner");

async function projectActions(projectPath) {
  while (true) {
    const projectName = projectPath.split("/").pop();

    const action = await select({
      message: `What do you want to do with ${projectName}?`,
      choices: [
        {
          name: "Open in Finder",
          value: "finder",
        },
        {
          name: "Open in VS Code",
          value: "vscode",
        },
        {
          name: "Open Terminal",
          value: "terminal",
        },
        {
          name: "Run project",
          value: "run",
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

    if (action === "finder") {
      exec(`open "${projectPath}"`);
    }

    if (action === "vscode") {
      exec(`code "${projectPath}"`);
    }

    if (action === "terminal") {
      const escapedPath = projectPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

      const command = `osascript -e 'tell application "Ghostty"
        activate
        set cfg to new surface configuration
        set initial working directory of cfg to "${escapedPath}"
        new window with configuration cfg
      end tell'`;

      exec(command);

      return;
    }

    if (action === "run") {
      runProject(projectPath);
      return;
    }

    if (action === "delete") {
      const confirmed = await confirm({
        message: `Delete ${projectName}?`,
        default: false,
      });

      if (!confirmed) {
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

    if (action === "back") {
      return;
    }
  }
}

module.exports = projectActions;
