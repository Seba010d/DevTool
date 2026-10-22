const { input } = require("@inquirer/prompts");

const { loadConfig, saveConfig, resetConfig } = require("./config");
const { themes, applyTheme } = require("./colors");

const chooseFolder = require("./folderBrowser");

const { drawHeader, drawSection, success, info } = require("./ui");

const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");

const { drawKeybindings, renderMenu, moveSelection, isBackKey, selectMenu } = require("./menu");

async function pauseForKey() {
  drawKeybindings("Enter Continue    Q Back");

  await waitForKey();
}

async function openSettings() {
  const initialConfig = loadConfig();
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
      name: "Color theme",
      icon: "🎨",
      meta: themes[initialConfig.theme]?.name || "Ocean",
      value: "theme",
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

        drawSection("CURRENT LOCATION");

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

        drawSection("CURRENT LOCATION");

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

      if (choice === "theme") {
        disableKeyboard();

        const themeResult = await selectMenu({
          title: "DEVTOOL / SETTINGS",
          subtitle: "Color theme",
          section: "CHOOSE A THEME",
          choices: Object.entries(themes).map(([value, theme]) => ({
            name: theme.name,
            icon: value === "ocean" ? "🌊" : value === "forest" ? "🌲" : value === "sunset" ? "🌅" : "◐",
            meta: value === config.theme ? "Current" : "",
            value,
          })),
        });

        if (themeResult.action !== "back" && themeResult.value) {
          config.theme = themeResult.value;
          applyTheme(config.theme);
          saveConfig(config);
          choices.find((item) => item.value === "theme").meta = themes[config.theme].name;

          clearScreen();
          drawHeader("DEVTOOL / SETTINGS", "Color theme");
          success(`Color theme changed to ${themes[config.theme].name}.`);
          await input({ message: "Press Enter to continue" });
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
          resetConfig();

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
