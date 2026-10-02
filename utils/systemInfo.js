const os = require("os");
const { execSync } = require("child_process");
const scanProjects = require("./projectScanner");

function getCommandVersion(command) {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch {
    return "Not found";
  }
}

function showSystemInfo(projectLocation) {
  const nodeVersion = getCommandVersion("node --version");
  const npmVersion = getCommandVersion("npm --version");

  const projects = scanProjects(projectLocation || os.homedir());

  console.log("");
  console.log("========================");
  console.log("       SYSTEM INFO");
  console.log("========================");
  console.log("");

  console.log(`OS: ${os.platform()}`);
  console.log(`Architecture: ${os.arch()}`);
  console.log(`Hostname: ${os.hostname()}`);
  console.log(`CPU: ${os.cpus()[0].model}`);
  console.log(`CPU cores: ${os.cpus().length}`);
  console.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`);
  console.log(`Node.js: ${nodeVersion}`);
  console.log(`npm: ${npmVersion}`);
  console.log(`DevTool projects: ${projects.length}`);
  console.log("");
}

module.exports = showSystemInfo;
