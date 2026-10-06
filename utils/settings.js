const { select, input } = require("@inquirer/prompts");
const { loadConfig, saveConfig } = require("./config");
const chooseFolder = require("./folderBrowser");
const { drawHeader, success, info } = require("./ui");

async function openSettings() {
  while (true) {
    console.clear();

    drawHeader("DEVTOOL / SETTINGS", "Configure DevTool");

    console.log("  SETTINGS");
    console.log("");

    const choice = await select({
      message: "Select:",
      choices: [
        {
          name: "📁  Projects location",
          value: "projects",
        },
        {
          name: "🕘  Last project location",
          value: "last",
        },
        {
          name: "🧹  Clear recent projects",
          value: "clear",
        },
        {
          name: "↩   Reset settings",
          value: "reset",
        },
        {
          name: "←   Back",
          value: "back",
        },
      ],
      loop: false,
    });

    if (choice === "back") {
      return;
    }

    const config = loadConfig();

    if (choice === "projects") {
      console.clear();

      drawHeader("DEVTOOL / SETTINGS", "Projects location");

      console.log("  CURRENT LOCATION");
      console.log("");
      info(config.projectsLocation);
      console.log("");

      const newLocation = await chooseFolder(config.projectsLocation);

      if (newLocation) {
        config.projectsLocation = newLocation;
        saveConfig(config);

        success("Projects location updated.");

        await input({
          message: "Press Enter to continue",
        });
      }
    }

    if (choice === "last") {
      console.clear();

      drawHeader("DEVTOOL / SETTINGS", "Last project location");

      console.log("  CURRENT LOCATION");
      console.log("");
      info(config.lastProjectLocation || "Not set");
      console.log("");

      const newLocation = await chooseFolder(config.lastProjectLocation || config.projectsLocation);

      if (newLocation) {
        config.lastProjectLocation = newLocation;
        saveConfig(config);

        success("Last project location updated.");

        await input({
          message: "Press Enter to continue",
        });
      }
    }

    if (choice === "clear") {
      config.recentProjects = [];
      saveConfig(config);

      success("Recent projects cleared.");

      await input({
        message: "Press Enter to continue",
      });
    }

    if (choice === "reset") {
      console.clear();

      drawHeader("DEVTOOL / SETTINGS", "Reset settings");

      const confirmation = await select({
        message: "Reset all settings?",
        choices: [
          {
            name: "Reset settings",
            value: true,
          },
          {
            name: "Cancel",
            value: false,
          },
        ],
        loop: false,
      });

      if (confirmation) {
        const defaultConfig = {
          projectsLocation: config.projectsLocation,
          lastProjectLocation: config.projectsLocation,
          recentProjects: [],
        };

        saveConfig(defaultConfig);

        success("Settings reset.");

        await input({
          message: "Press Enter to continue",
        });
      }
    }
  }
}

module.exports = openSettings;
