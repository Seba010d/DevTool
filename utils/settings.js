const { select } = require("@inquirer/prompts");

const chooseFolder = require("./folderBrowser");
const { loadConfig, saveConfig } = require("./config");

async function openSettings() {
  while (true) {
    const answer = await select({
      message: "Settings:",
      choices: [
        {
          name: "Projects location",
          value: "projects-location",
        },
        {
          name: "Last project location",
          value: "last-project-location",
        },
        {
          name: "← Back",
          value: "back",
        },
      ],
      loop: false,
    });

    if (answer === "back") {
      return;
    }

    if (answer === "projects-location") {
      const config = loadConfig();

      const newLocation = await chooseFolder(config.projectsLocation);

      config.projectsLocation = newLocation;

      saveConfig(config);

      console.log("");
      console.log(`Projects location changed to: ${newLocation}`);
      console.log("");
    }

    if (answer === "last-project-location") {
      const config = loadConfig();

      console.log("");
      console.log(`Last project location: ${config.lastProjectLocation}`);
      console.log("");

      await select({
        message: "Continue:",
        choices: [
          {
            name: "← Back",
            value: "back",
          },
        ],
      });
    }
  }
}

module.exports = openSettings;
