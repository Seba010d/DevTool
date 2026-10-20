const { input } = require("@inquirer/prompts");

const { loadConfig, saveConfig } = require("./config");

const chooseFolder = require("./folderBrowser");

const { drawHeader, success, info } = require("./ui");

const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");

const { drawKeybindings, renderMenu, moveSelection, isBackKey, selectMenu } = require("./menu");

async function pauseForKey() {
  drawKeybindings("Enter Continue    Q Back");

  await waitForKey();
}

async function openSettings() {
  const choices = [
    {
      name: "Projects location",
      icon: "📁",
      value: "projects",
    },
    {
      name: "Last project location",
      icon: "🕘",
      value: "last",
    },
    {
      name: "Clear recent projects",
      icon: "🧹",
      value: "clear",
    },
    {
      name: "Reset settings",
      icon: "↩",
      value: "reset",
    },
  ];

  let selectedIndex = 0;

  enableKeyboard();

  try {
    while (true) {
      renderMenu({
        title: "DEVTOOL / SETTINGS",
        subtitle: "Configure DevTool",
        section: "SETTINGS",
        choices,
        selectedIndex,
      });

      const key = await waitForKey();

      if (key.name === "up") {
        selectedIndex = moveSelection(selectedIndex, "up", choices.length);

        continue;
      }

      if (key.name === "down") {
        selectedIndex = moveSelection(selectedIndex, "down", choices.length);

        continue;
      }

      if (isBackKey(key)) {
        return;
      }

      if (key.name !== "return") {
        continue;
      }

      const choice = choices[selectedIndex].value;

      const config = loadConfig();

      if (choice === "projects") {
        disableKeyboard();

        clearScreen();

        drawHeader("DEVTOOL / SETTINGS", "Projects location");

        console.log("  CURRENT LOCATION");

        console.log("");

        info(config.projectsLocation);

        console.log("");

        const newLocation = await chooseFolder(config.projectsLocation);

        if (newLocation) {
          config.projectsLocation = newLocation;

          saveConfig(config);

          clearScreen();

          drawHeader("DEVTOOL / SETTINGS", "Projects location");

          success("Projects location updated.");

          await input({
            message: "Press Enter to continue",
          });
        }

        enableKeyboard();
      }

      if (choice === "last") {
        disableKeyboard();

        clearScreen();

        drawHeader("DEVTOOL / SETTINGS", "Last project location");

        console.log("  CURRENT LOCATION");

        console.log("");

        info(config.lastProjectLocation || "Not set");

        console.log("");

        const newLocation = await chooseFolder(config.lastProjectLocation || config.projectsLocation);

        if (newLocation) {
          config.lastProjectLocation = newLocation;

          saveConfig(config);

          clearScreen();

          drawHeader("DEVTOOL / SETTINGS", "Last project location");

          success("Last project location updated.");

          await input({
            message: "Press Enter to continue",
          });
        }

        enableKeyboard();
      }

      if (choice === "clear") {
        disableKeyboard();

        config.recentProjects = [];

        saveConfig(config);

        clearScreen();

        drawHeader("DEVTOOL / SETTINGS", "Clear recent projects");

        success("Recent projects cleared.");

        await input({
          message: "Press Enter to continue",
        });

        enableKeyboard();
      }

      if (choice === "reset") {
        disableKeyboard();
        const confirmation = await selectMenu({
          title: "DEVTOOL / SETTINGS",
          subtitle: "Reset settings",
          section: "RESET SETTINGS",
          choices: [
            { name: "Cancel", icon: "←", value: false },
            { name: "Reset settings", icon: "↩", value: true },
          ],
        });

        if (confirmation.value) {
          const defaultConfig = {
            projectsLocation: config.projectsLocation,
            lastProjectLocation: config.projectsLocation,
            recentProjects: [],
          };

          saveConfig(defaultConfig);

          clearScreen();

          drawHeader("DEVTOOL / SETTINGS", "Reset settings");

          success("Settings reset.");

          await input({
            message: "Press Enter to continue",
          });
        }

        enableKeyboard();
      }
    }
  } finally {
    disableKeyboard();
  }
}

module.exports = openSettings;
