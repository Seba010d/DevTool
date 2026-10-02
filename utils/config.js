const fs = require("fs");
const os = require("os");
const path = require("path");

const userConfigPath = path.join(os.homedir(), ".config", "devtool", "config.json");
const defaultConfigPath = path.join(__dirname, "..", "config", "config.json");

function expandHome(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  if (value === "~") return os.homedir();
  if (value.startsWith(`~${path.sep}`)) return path.join(os.homedir(), value.slice(2));
  return path.resolve(value);
}

function getDefaultProjectLocation() {
  const projectsPath = path.join(os.homedir(), "Projects");
  return fs.existsSync(projectsPath) ? projectsPath : os.homedir();
}

function loadConfig() {
  let config = {};
  try {
    const configPath = fs.existsSync(userConfigPath) ? userConfigPath : defaultConfigPath;
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    config = {};
  }
  const configuredPath = expandHome(config.lastProjectLocation);
  return { ...config, lastProjectLocation: configuredPath || getDefaultProjectLocation() };
}

function saveConfig(config) {
  fs.mkdirSync(path.dirname(userConfigPath), { recursive: true });
  fs.writeFileSync(userConfigPath, JSON.stringify({
    ...config,
    lastProjectLocation: expandHome(config.lastProjectLocation),
  }, null, 2));
}

module.exports = { loadConfig, saveConfig };
