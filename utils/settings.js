const { select } = require("@inquirer/prompts");

const chooseFolder = require("./folderBrowser");
const { loadConfig, saveConfig, clearRecentProjects, resetConfig } = require("./config");

async function openSettings() {
  while (true) {
    const config = loadConfig();

    const answer = await select({
      message: "Settings:",
      choices: [
        {
          name: `Projects location (${config.projectsLocation})`,
          value: "projects-location",
        },
        {
          name: `Last project location (${config.lastProjectLocation})`,
          value: "last-project-location",
        },
        {
          name: "Clear recent projects",
          value: "clear-recent",
        },
        {
          name: "Reset settings",
          value: "reset",
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

      if (!newLocation) {
        continue;
      }

      config.projectsLocation = newLocation;

      saveConfig(config);

      console.log("");
      console.log(`Projects location changed to: ${newLocation}`);
      console.log("");
    }

    if (answer === "last-project-location") {
      const config = loadConfig();

      const newLocation = await chooseFolder(config.lastProjectLocation);

      if (!newLocation) {
        continue;
      }

      config.lastProjectLocation = newLocation;

      saveConfig(config);

      console.log("");
      console.log(`Last project location changed to: ${newLocation}`);
      console.log("");
    }

    if (answer === "clear-recent") {
      clearRecentProjects();

      console.log("");
      console.log("Recent projects cleared.");
      console.log("");
    }

    if (answer === "reset") {
      const confirmation = await select({
        message: "Reset all DevTool settings?",
        choices: [
          {
            name: "Yes, reset settings",
            value: "yes",
          },
          {
            name: "No, cancel",
            value: "no",
          },
        ],
        loop: false,
      });

      if (confirmation !== "yes") {
        continue;
      }

      resetConfig();

      console.log("");
      console.log("Settings reset.");
      console.log("");
    }
  }
}

module.exports = openSettings;
