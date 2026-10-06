const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { success, error } = require("./ui");

function runProject(projectPath) {
  const packagePath = path.join(projectPath, "package.json");
  const devtoolPath = path.join(projectPath, ".devtool.json");

  if (!fs.existsSync(packagePath)) {
    error("No package.json found.");
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  let devtoolConfig = {};

  if (fs.existsSync(devtoolPath)) {
    try {
      devtoolConfig = JSON.parse(fs.readFileSync(devtoolPath, "utf8"));
    } catch {
      devtoolConfig = {};
    }
  }

  const runCommand = devtoolConfig.run || (packageJson.scripts?.start ? "npm start" : null);

  if (!runCommand) {
    error("No run command found.");
    return;
  }

  const projectName = packageJson.name || path.basename(projectPath);

  const escapedPath = projectPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const escapedCommand = runCommand.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const command = `osascript -e 'tell application "Ghostty"
    activate
    set cfg to new surface configuration
    set initial working directory of cfg to "${escapedPath}"
    set command of cfg to "/bin/zsh -lc '\\''eval \\\\"$(/opt/homebrew/bin/brew shellenv)\\\\"; ${escapedCommand}'\\''"
    new window with configuration cfg
  end tell'`;

  exec(command, (errorObject) => {
    if (errorObject) {
      error(`Could not start ${projectName}.`);
      return;
    }

    success(`Started ${projectName}.`);
  });
}

module.exports = runProject;
