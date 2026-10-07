const fs = require("fs");
const path = require("path");

const { drawHeader } = require("./ui");
const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");
const { drawKeybindings, renderChoice, moveSelection, isBackKey } = require("./menu");

async function chooseFolder(startPath) {
  let currentPath = startPath;

  enableKeyboard();

  try {
    while (true) {
      const entries = fs
        .readdirSync(currentPath, {
          withFileTypes: true,
        })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          }),
        );

      const choices = entries.map((entry) => ({
        name: entry.name,
        icon: "📁",
        value: {
          type: "folder",
          path: path.join(currentPath, entry.name),
        },
      }));

      choices.push({
        name: "Select this folder",
        icon: "✓",
        value: {
          type: "select",
          path: currentPath,
        },
      });

      if (currentPath !== path.parse(currentPath).root) {
        choices.push({
          name: "Parent folder",
          icon: "↑",
          value: {
            type: "parent",
            path: path.dirname(currentPath),
          },
        });
      }

      clearScreen();

      drawHeader("DEVTOOL / FOLDER", path.relative(process.env.HOME || "", currentPath) || currentPath);

      console.log("  SELECT FOLDER");
      console.log("");

      if (!choices.length) {
        console.log("  No folders found.");

        console.log("");
      }

      let selectedIndex = 0;

      while (true) {
        choices.forEach((choice, index) => {
          console.log(renderChoice(choice, index === selectedIndex));
        });

        drawKeybindings();

        const key = await waitForKey();

        if (key.name === "up") {
          selectedIndex = moveSelection(selectedIndex, "up", choices.length);

          clearScreen();

          drawHeader("DEVTOOL / FOLDER", path.relative(process.env.HOME || "", currentPath) || currentPath);

          console.log("  SELECT FOLDER");

          console.log("");

          continue;
        }

        if (key.name === "down") {
          selectedIndex = moveSelection(selectedIndex, "down", choices.length);

          clearScreen();

          drawHeader("DEVTOOL / FOLDER", path.relative(process.env.HOME || "", currentPath) || currentPath);

          console.log("  SELECT FOLDER");

          console.log("");

          continue;
        }

        if (isBackKey(key)) {
          return null;
        }

        if (key.name === "return") {
          const selected = choices[selectedIndex];

          if (selected.value.type === "select") {
            return selected.value.path;
          }

          if (selected.value.type === "parent") {
            currentPath = selected.value.path;

            break;
          }

          if (selected.value.type === "folder") {
            currentPath = selected.value.path;

            break;
          }
        }
      }
    }
  } finally {
    disableKeyboard();
  }
}

module.exports = chooseFolder;
