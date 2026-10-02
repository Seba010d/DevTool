const fs = require("fs");
const path = require("path");
const { select, input } = require("@inquirer/prompts");

const chooseFolder = require("./utils/folderBrowser");
const browseProjects = require("./utils/projectBrowser");
const showSystemInfo = require("./utils/systemInfo");
const { loadConfig, saveConfig } = require("./utils/config");

const createEmptyProject = require("./templates/empty");
const createNodeProject = require("./templates/node");
const createBoilerplateProject = require("./templates/boilerplate");

async function createProject() {
  const config = loadConfig();

  const projectName = await input({
    message: "Project name:",
  });

  console.log("");

  const startLocation = config.lastProjectLocation;

  console.log("Choose project location:");

  const projectLocation = await chooseFolder(startLocation);

  config.lastProjectLocation = projectLocation;
  saveConfig(config);

  const projectPath = path.join(projectLocation, projectName);

  fs.mkdirSync(projectPath);

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
        name: "Boilerplate",
        value: "boilerplate",
      },
    ],
    loop: false,
  });

  if (template === "empty") {
    createEmptyProject(projectPath);
  }

  if (template === "node") {
    createNodeProject(projectPath);
  }

  if (template === "boilerplate") {
    createBoilerplateProject(projectPath);
  }

  const devtoolConfig = {
    type: "project",
    template,
  };

  fs.writeFileSync(path.join(projectPath, ".devtool.json"), JSON.stringify(devtoolConfig, null, 2));

  console.log("");
  console.log(`Project created: ${projectPath}`);
}

async function listProjects() {
  const { lastProjectLocation } = loadConfig();
  await browseProjects(lastProjectLocation);
}

async function main() {
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
          name: "List projects",
          value: "list",
        },
        {
          name: "System info",
          value: "system",
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

      case "system":
        showSystemInfo(loadConfig().lastProjectLocation);

        await input({
          message: "Press Enter to continue",
        });

        break;

      case "exit":
        console.log("");
        console.log("Goodbye!");
        return;
    }
  }
}

main();
