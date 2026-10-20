const fs = require("fs");
const os = require("os");
const path = require("path");
const { input } = require("@inquirer/prompts");

const { drawHeader, drawSection, info } = require("./ui");
const { enableKeyboard, disableKeyboard, waitForKey } = require("./keyboard");
const { drawKeybindings, renderChoiceList, moveSelection, isBackKey } = require("./menu");
const isProject = require("./projectDetector");

function renderFolderList(currentPath, entries, choices, selectedIndex) {
  const location = path.relative(process.env.HOME || "", currentPath) || currentPath;
  drawHeader("DEVTOOL / LOCATION", location);
  renderChoiceList({
    section: "CHOOSE A FOLDER",
    choices,
    selectedIndex,
    emptyMessage: "This folder is empty.",
  });

  drawKeybindings("↑↓ Move    Enter Open or choose    Q Cancel");
}

async function chooseFolder(startPath) {
  let currentPath = startPath;
  try {
    if (!fs.statSync(currentPath).isDirectory()) currentPath = os.homedir();
  } catch {
    currentPath = os.homedir();
  }

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
        icon: isProject(path.join(currentPath, entry.name)) ? "📦" : "📁",
        meta: isProject(path.join(currentPath, entry.name)) ? "Project" : "Folder",
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

      choices.push({
        name: "Create a new folder here",
        icon: "＋",
        value: { type: "create", path: currentPath },
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

      let selectedIndex = 0;

      while (true) {
        renderFolderList(currentPath, entries, choices, selectedIndex);

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
          return null;
        }

        if (key.name === "return") {
          const selected = choices[selectedIndex];

          if (selected.value.type === "select") {
            return selected.value.path;
          }

          if (selected.value.type === "create") {
            disableKeyboard();
            drawHeader("DEVTOOL / NEW FOLDER", "Choose a name for the folder");
            drawSection("LOCATION");
            info(currentPath);
            console.log("");
            drawSection("FOLDER NAME");
            console.log("");
            const folderName = (await input({ message: "Name:" })).trim();
            if (folderName && folderName !== "." && folderName !== ".." && !folderName.includes(path.sep)) {
              const newPath = path.join(currentPath, folderName);
              if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
            }
            enableKeyboard();
            break;
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
