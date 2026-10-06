const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function runProject(projectPath) {
  const packagePath = path.join(projectPath, "package.json");
  const devtoolPath = path.join(projectPath, ".devtool.json");

  if (!fs.existsSync(packagePath)) {
    console.log("");
    console.log("No package.json found.");
    console.log("");
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
    console.log("");
    console.log("No run command found.");
    console.log("");
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

  exec(command, (error) => {
    if (error) {
      console.log("");
      console.log(`Could not start ${projectName}.`);
      console.log("");
    }
  });
}

module.exports = runProject;
