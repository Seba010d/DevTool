#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");

const chooseFolder = require("./utils/folderBrowser");
const browseProjects = require("./utils/projectBrowser");
const openSettings = require("./utils/settings");
const { loadConfig, saveConfig } = require("./utils/config");
const { drawHeader, drawFooter, success, error } = require("./utils/ui");

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

  drawHeader("DEVTOOL", "Create a new project");

  console.log("  PROJECT SETUP");
  console.log("");

  const start = await select({
    message: "Create project:",
    choices: [
      {
        name: "Continue",
        value: "continue",
      },
      {
        name: "Back",
        value: "cancel",
      },
    ],
    loop: false,
  });

  if (start === "cancel") {
    return;
  }

  console.clear();

  drawHeader("DEVTOOL", "Create a new project");

  console.log("  PROJECT SETUP");
  console.log("");

  const projectName = (
    await input({
      message: "Project name:",
    })
  ).trim();

  if (!projectName) {
    return;
  }

  const config = loadConfig();

  const projectLocation = await chooseFolder(config.lastProjectLocation);

  if (!projectLocation) {
    return;
  }

  const projectPath = path.join(projectLocation, projectName);

  if (fs.existsSync(projectPath)) {
    console.clear();

    drawHeader("DEVTOOL", "Project already exists");

    error(`A project named "${projectName}" already exists.`);

    await input({
      message: "Press Enter to continue",
    });

    return;
  }

  console.clear();

  drawHeader("DEVTOOL", "Choose a project template");

  console.log("  TEMPLATES");
  console.log("");

  const template = await select({
    message: "Choose:",
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
        name: "Back",
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

  console.clear();

  drawHeader("DEVTOOL", "Project created");

  console.log("  RESULT");
  console.log("");

  success(`Created ${projectName}`);

  console.log(`  ${projectPath}`);

  await input({
    message: "Press Enter to continue",
  });
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
    console.log("");
    console.log("DEVTOOL");
    console.log("");
    console.log("Usage:");
    console.log("  devtool");
    console.log("  devtool create");
    console.log("");
    return;
  }

  if (process.argv[2]) {
    console.error(`Unknown command: ${process.argv[2]}`);
    process.exitCode = 1;
    return;
  }

  while (true) {
    console.clear();

    drawHeader("DEVTOOL", "Project Launcher");

    console.log("  QUICK ACTIONS");
    console.log("");

    const answer = await select({
      message: "Select:",
      choices: [
        {
          name: "Projects",
          value: "list",
        },
        {
          name: "Create project",
          value: "create",
        },
        {
          name: "Settings",
          value: "settings",
        },
        {
          name: "Quit",
          value: "exit",
        },
      ],
      loop: false,
    });

    if (answer === "create") {
      await createProject();
    }

    if (answer === "list") {
      await listProjects();
    }

    if (answer === "settings") {
      await openSettings();
    }

    if (answer === "exit") {
      console.clear();

      drawHeader("DEVTOOL", "Project Launcher");
      drawFooter("Goodbye");

      return;
    }
  }
}

main().catch((errorObject) => {
  if (errorObject.name === "ExitPromptError") {
    return;
  }

  console.error(errorObject.message);
  process.exitCode = 1;
});
