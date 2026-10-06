const { select } = require("@inquirer/prompts");

const chooseFolder = require("./folderBrowser");
const { loadConfig, saveConfig, clearRecentProjects, resetConfig } = require("./config");

const { drawHeader, drawFooter, success } = require("./ui");

async function openSettings() {
  while (true) {
    console.clear();

    const config = loadConfig();

    drawHeader("DEVTOOL / SETTINGS", "Configure DevTool");

    const answer = await select({
      message: "Settings:",
      choices: [
        {
          name: `Projects location  ${config.projectsLocation}`,
          value: "projects-location",
        },
        {
          name: `Last project location  ${config.lastProjectLocation}`,
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

      success(`Projects location changed to: ${newLocation}`);

      await new Promise((resolve) => setTimeout(resolve, 700));
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

      success(`Last project location changed to: ${newLocation}`);

      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    if (answer === "clear-recent") {
      clearRecentProjects();

      console.log("");

      success("Recent projects cleared.");

      await new Promise((resolve) => setTimeout(resolve, 700));
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

      success("Settings reset.");

      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }
}

module.exports = openSettings;
