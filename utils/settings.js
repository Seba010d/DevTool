const { select, input } = require("@inquirer/prompts");

const chooseFolder = require("./folderBrowser");
const { loadConfig, saveConfig, clearRecentProjects, resetConfig } = require("./config");
const { drawHeader, success, info } = require("./ui");

async function openSettings() {
  while (true) {
    console.clear();

    const config = loadConfig();

    drawHeader("DEVTOOL / SETTINGS", "Configuration");

    const answer = await select({
      message: "Select setting:",
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
      const newLocation = await chooseFolder(config.projectsLocation);

      if (!newLocation) {
        continue;
      }

      config.projectsLocation = newLocation;
      saveConfig(config);

      console.clear();
      drawHeader("DEVTOOL / SETTINGS", "Projects location");

      success("Projects location updated.");
      console.log("");
      info(newLocation);

      await input({ message: "Press Enter to continue" });
    }

    if (answer === "last-project-location") {
      const newLocation = await chooseFolder(config.lastProjectLocation);

      if (!newLocation) {
        continue;
      }

      config.lastProjectLocation = newLocation;
      saveConfig(config);

      console.clear();
      drawHeader("DEVTOOL / SETTINGS", "Last project location");

      success("Last project location updated.");
      console.log("");
      info(newLocation);

      await input({ message: "Press Enter to continue" });
    }

    if (answer === "clear-recent") {
      clearRecentProjects();

      console.clear();
      drawHeader("DEVTOOL / SETTINGS", "Recent projects");

      success("Recent projects cleared.");

      await input({ message: "Press Enter to continue" });
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

      console.clear();
      drawHeader("DEVTOOL / SETTINGS", "Configuration");

      success("Settings reset.");

      await input({ message: "Press Enter to continue" });
    }
  }
}

module.exports = openSettings;
