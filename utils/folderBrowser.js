const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts");
const { drawHeader } = require("./ui");

async function chooseFolder(startPath) {
  let currentPath = startPath;

  while (true) {
    console.clear();

    drawHeader("DEVTOOL / FOLDER", path.relative(process.env.HOME || "", currentPath) || currentPath);

    console.log("  SELECT FOLDER");
    console.log("");

    const entries = fs
      .readdirSync(currentPath, {
        withFileTypes: true,
      })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));

    const choices = entries.map((entry) => ({
      name: `📁  ${entry.name}`,
      value: {
        type: "folder",
        path: path.join(currentPath, entry.name),
      },
    }));

    choices.push({
      name: "✓   Select this folder",
      value: {
        type: "select",
        path: currentPath,
      },
    });

    if (currentPath !== path.parse(currentPath).root) {
      choices.push({
        name: "↑   Parent folder",
        value: {
          type: "parent",
          path: path.dirname(currentPath),
        },
      });
    }

    choices.push({
      name: "←  Cancel",
      value: {
        type: "cancel",
      },
    });

    const selected = await select({
      message: "Select:",
      choices,
      loop: false,
    });

    if (selected.type === "select") {
      return selected.path;
    }

    if (selected.type === "cancel") {
      return null;
    }

    if (selected.type === "parent") {
      currentPath = selected.path;
      continue;
    }

    if (selected.type === "folder") {
      currentPath = selected.path;
    }
  }
}

module.exports = chooseFolder;
