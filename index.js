#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");

const chooseFolder = require("./utils/folderBrowser");
const browseProjects = require("./utils/projectBrowser");
const openSettings = require("./utils/settings");
const { loadConfig, saveConfig } = require("./utils/config");

const createEmptyProject = require("./templates/empty");
const createNodeProject = require("./templates/node");
const createWebProject = require("./templates/web");

async function createProject() {
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

  const projectName = await input({
    message: "Project name:",
  });

  console.log("");

  const startLocation = config.lastProjectLocation;

  console.log("Choose project location:");

  const projectLocation = await chooseFolder(startLocation);

  if (!projectLocation) {
    return;
  }

  const projectPath = path.join(projectLocation, projectName);

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
      { name: "Web", value: "web" },
      { name: "Web + SCSS", value: "web-scss" },
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

  if (template === "web") createWebProject(projectPath, false);
  if (template === "web-scss") createWebProject(projectPath, true);

  const devtoolConfig = {
    type: "project",
    template,
  };

  fs.writeFileSync(path.join(projectPath, ".devtool.json"), JSON.stringify(devtoolConfig, null, 2));

  console.log("");
  console.log(`Project created: ${projectPath}`);
}

async function listProjects() {
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

    console.log("========================");
    console.log("        DEVTOOL");
    console.log("========================");
    console.log("");

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
        console.log("");
        console.log("Goodbye!");
        return;
    }
  }
}

main().catch((error) => {
  if (error.name === "ExitPromptError") return;
  console.error(error.message);
  process.exitCode = 1;
});
