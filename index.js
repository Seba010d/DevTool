#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");

const chooseFolder = require("./utils/folderBrowser");
const browseProjects = require("./utils/projectBrowser");
const openSettings = require("./utils/settings");
const { loadConfig, saveConfig } = require("./utils/config");
const { drawHeader, drawFooter } = require("./utils/ui");

const createEmptyProject = require("./templates/empty");
const createNodeProject = require("./templates/node");
const createExpressProject = require("./templates/express");
const createWebProject = require("./templates/web");
const createJavaScriptProject = require("./templates/javascript");
const createBoilerplateProject = require("./templates/boilerplate");

function getDanishDateTime() {
  return new Intl.DateTimeFormat("da-DK", {
    timeZone: "Europe/Copenhagen",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(",", "");
}

async function createProject() {
  console.clear();

  drawHeader("DEVTOOL / CREATE PROJECT", "Create a new project");

  const start = await select({
    message: "Create project:",
    choices: [
      {
        name: "Continue",
        value: "continue",
      },
      {
        name: "← Cancel",
        value: "cancel",
      },
    ],
    loop: false,
  });

  if (start === "cancel") {
    return;
  }

  const config = loadConfig();

  const projectName = (
    await input({
      message: "Project name:",
    })
  ).trim();

  if (!projectName) {
    return;
  }

  console.log("");

  const projectLocation = await chooseFolder(config.lastProjectLocation);

  if (!projectLocation) {
    return;
  }

  const projectPath = path.join(projectLocation, projectName);

  if (fs.existsSync(projectPath)) {
    console.log("");
    console.log(`A project named "${projectName}" already exists.`);
    console.log("");
    return;
  }

  const template = await select({
    message: "Choose a project template:",
    choices: [
      {
        name: "Empty project",
        value: "empty",
      },
      {
        name: "Node.js project",
        value: "node",
      },
      {
        name: "Node.js + Express",
        value: "express",
      },
      {
        name: "Web",
        value: "web",
      },
      {
        name: "Web + SCSS",
        value: "web-scss",
      },
      {
        name: "JavaScript App",
        value: "javascript",
      },
      {
        name: "Boilerplate",
        value: "boilerplate",
      },
      {
        name: "← Cancel",
        value: "cancel",
      },
    ],
    loop: false,
  });

  if (template === "cancel") {
    return;
  }

  config.lastProjectLocation = projectLocation;
  saveConfig(config);

  fs.mkdirSync(projectPath);

  if (template === "empty") {
    createEmptyProject(projectPath);
  }

  if (template === "node") {
    createNodeProject(projectPath);
  }

  if (template === "express") {
    createExpressProject(projectPath);
  }

  if (template === "web") {
    createWebProject(projectPath, false);
  }

  if (template === "web-scss") {
    createWebProject(projectPath, true);
  }

  if (template === "javascript") {
    createJavaScriptProject(projectPath);
  }

  if (template === "boilerplate") {
    createBoilerplateProject(projectPath);
  }

  const projectTypes = {
    empty: "empty",
    node: "node",
    express: "node",
    web: "web",
    "web-scss": "web",
    javascript: "javascript",
    boilerplate: "boilerplate",
  };

  const runCommands = {
    empty: null,
    node: "npm start",
    express: "npm start",
    web: null,
    "web-scss": "npm run build",
    javascript: null,
    boilerplate: null,
  };

  const devtoolConfig = {
    name: projectName,
    type: "project",
    template,
    projectType: projectTypes[template],
    created: getDanishDateTime(),
    run: runCommands[template],
  };

  fs.writeFileSync(path.join(projectPath, ".devtool.json"), JSON.stringify(devtoolConfig, null, 2) + "\n");

  console.log("");
  console.log(`Project created: ${projectPath}`);
  console.log("");
}

async function listProjects() {
  console.clear();

  const { projectsLocation } = loadConfig();

  await browseProjects(projectsLocation);
}

async function main() {
  if (process.argv[2] === "create") {
    await createProject();
    return;
  }

  if (process.argv[2] === "--help" || process.argv[2] === "-h") {
    console.log("Usage: devtool [create]");
    console.log("\nCommands:\n  create    Create a project directly");
    return;
  }

  if (process.argv[2]) {
    console.error(`Unknown command: ${process.argv[2]}`);
    process.exitCode = 1;
    return;
  }

  while (true) {
    console.clear();

    drawHeader("DEVTOOL", "Developer Toolbox");

    const answer = await select({
      message: "What do you want to do?",
      choices: [
        {
          name: "Create project",
          value: "create",
        },
        {
          name: "Projects",
          value: "list",
        },
        {
          name: "Settings",
          value: "settings",
        },
        {
          name: "Exit",
          value: "exit",
        },
      ],
      loop: false,
    });

    switch (answer) {
      case "create":
        await createProject();
        break;

      case "list":
        await listProjects();
        break;

      case "settings":
        await openSettings();
        break;

      case "exit":
        console.clear();
        drawHeader("DEVTOOL", "Developer Toolbox");
        drawFooter("Goodbye!");
        return;
    }
  }
}

main().catch((error) => {
  if (error.name === "ExitPromptError") return;

  console.error(error.message);
  process.exitCode = 1;
});
