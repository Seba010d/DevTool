const fs = require("fs");
const os = require("os");
const path = require("path");

const userConfigPath = path.join(os.homedir(), ".config", "devtool", "config.json");

const defaultConfigPath = path.join(__dirname, "..", "config", "config.json");

function expandHome(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  if (value === "~") {
    return os.homedir();
  }

  if (value.startsWith(`~${path.sep}`)) {
    return path.join(os.homedir(), value.slice(2));
  }

  return path.resolve(value);
}

function getDefaultProjectLocation() {
  const projectsPath = path.join(os.homedir(), "Github");

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

  const projectsLocation = expandHome(config.projectsLocation) || getDefaultProjectLocation();

  const lastProjectLocation = expandHome(config.lastProjectLocation) || projectsLocation;

  return {
    ...config,
    projectsLocation,
    lastProjectLocation,
    recentProjects: Array.isArray(config.recentProjects) ? config.recentProjects : [],
  };
}

function saveConfig(config) {
  fs.mkdirSync(path.dirname(userConfigPath), {
    recursive: true,
  });

  const projectsLocation = expandHome(config.projectsLocation) || getDefaultProjectLocation();

  const lastProjectLocation = expandHome(config.lastProjectLocation) || projectsLocation;

  const savedConfig = {
    ...config,
    projectsLocation,
    lastProjectLocation,
    recentProjects: Array.isArray(config.recentProjects) ? config.recentProjects : [],
  };

  fs.writeFileSync(userConfigPath, JSON.stringify(savedConfig, null, 2) + "\n");
}

function addRecentProject(projectPath) {
  const config = loadConfig();

  const recentProjects = config.recentProjects.filter((recentPath) => recentPath !== projectPath);

  recentProjects.unshift(projectPath);

  config.recentProjects = recentProjects.slice(0, 5);

  saveConfig(config);
}

function removeRecentProject(projectPath) {
  const config = loadConfig();

  config.recentProjects = config.recentProjects.filter((recentPath) => recentPath !== projectPath);

  saveConfig(config);
}

function updateRecentProject(oldPath, newPath) {
  const config = loadConfig();

  config.recentProjects = config.recentProjects.map((recentPath) => (recentPath === oldPath ? newPath : recentPath));

  saveConfig(config);
}

module.exports = {
  loadConfig,
  saveConfig,
  addRecentProject,
  removeRecentProject,
  updateRecentProject,
};
