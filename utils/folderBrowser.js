const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts");

async function chooseFolder(startPath) {
  let currentPath = startPath;

  while (true) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));

    const choices = entries.map((entry) => ({
      name: `📁 ${entry.name}`,
      value: path.join(currentPath, entry.name),
    }));

    choices.push({
      name: "✓ Select this folder",
      value: "__select__",
    });

    choices.push({
      name: "← Cancel",
      value: "__cancel__",
    });

    const parentPath = path.dirname(currentPath);

    if (parentPath !== currentPath) {
      choices.push({
        name: "← Go back",
        value: "__back__",
      });
    }

    const selected = await select({
      message: `Current folder: ${currentPath}`,
      choices,
      loop: false,
    });

    if (selected === "__select__") {
      return currentPath;
    }

    if (selected === "__cancel__") {
      return null;
    }

    if (selected === "__back__") {
      currentPath = parentPath;
      continue;
    }

    currentPath = selected;
  }
}

module.exports = chooseFolder;
