#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { input } = require("@inquirer/prompts");

const chooseFolder = require("./utils/folderBrowser");
const browseProjects = require("./utils/projectBrowser");
const openSettings = require("./utils/settings");
const { loadConfig, saveConfig } = require("./utils/config");
const { drawHeader, drawFooter, success, error } = require("./utils/ui");
const { selectMenu } = require("./utils/menu");
const { disableKeyboard, exitProcess } = require("./utils/keyboard");

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
  disableKeyboard();

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

  const templateResult = await selectMenu({
    title: "DEVTOOL",
    subtitle: "Create a new project",
    section: "TEMPLATES",
    choices: [
      {
        name: "Empty project",
        icon: "📦",
        value: "empty",
      },
      {
        name: "Node.js project",
        icon: "📦",
        value: "node",
      },
      {
        name: "Node.js + Express",
        icon: "📦",
        value: "express",
      },
      {
        name: "Web",
        icon: "🌐",
        value: "web",
      },
      {
        name: "Web + SCSS",
        icon: "🌐",
        value: "web-scss",
      },
      {
        name: "JavaScript App",
        icon: "📜",
        value: "javascript",
      },
      {
        name: "Boilerplate",
        icon: "📦",
        value: "boilerplate",
      },
    ],
  });

  if (templateResult.action === "back") {
    return;
  }

  const template = templateResult.value;

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
  disableKeyboard();

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
    const answer = await selectMenu({
      title: "DEVTOOL",
      subtitle: "Project Launcher",
      section: "QUICK ACTIONS",
      choices: [
        {
          name: "Projects",
          icon: "📦",
          value: "list",
        },
        {
          name: "Create project",
          icon: "＋",
          value: "create",
        },
        {
          name: "Settings",
          icon: "⚙",
          value: "settings",
        },
        {
          name: "Quit",
          icon: "✕",
          value: "exit",
        },
      ],
    });

    if (answer.action === "back") {
      continue;
    }

    if (answer.value === "create") {
      await createProject();
    }

    if (answer.value === "list") {
      await listProjects();
    }

    if (answer.value === "settings") {
      await openSettings();
    }

    if (answer.value === "exit") {
      disableKeyboard();

      console.clear();

      drawHeader("DEVTOOL", "Project Launcher");

      drawFooter("Goodbye");

      exitProcess(0);
    }
  }
}

main().catch((errorObject) => {
  if (errorObject.name === "ExitPromptError") {
    exitProcess(0);
  }

  console.error(errorObject.message);
  process.exitCode = 1;
});
