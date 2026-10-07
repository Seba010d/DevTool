const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");

const DEFAULT_KEYBINDINGS = "↑↓ Navigate    Enter Select    Q Back";

function drawKeybindings(bindings = DEFAULT_KEYBINDINGS) {
  console.log("");

  console.log("─".repeat(Math.min(Math.max(process.stdout.columns || 80, 60), 90)));

  console.log("");

  console.log(`  ${bindings}`);
}

function getDisplayWidth(text) {
  let width = 0;

  for (const character of text) {
    const code = character.codePointAt(0);

    if ((code >= 0x1f300 && code <= 0x1faff) || (code >= 0x2600 && code <= 0x27bf)) {
      width += 2;
    } else {
      width += 1;
    }
  }

  return width;
}

function padDisplayWidth(text, width) {
  const currentWidth = getDisplayWidth(text);

  if (currentWidth >= width) {
    return text;
  }

  return text + " ".repeat(width - currentWidth);
}

function renderChoice(choice, selected) {
  const pointer = selected ? "❯" : " ";
  const icon = padDisplayWidth(choice.icon || "", 2);

  return `${pointer}  ${icon}  ${choice.name}`;
}

function renderMenu({ title, subtitle, section, choices, selectedIndex = 0, header, footer = DEFAULT_KEYBINDINGS }) {
  clearScreen();

  if (header) {
    header();
  } else {
    console.log("");
    console.log(`  ${title}`);

    if (subtitle) {
      console.log(`  ${subtitle}`);
    }

    console.log("");
  }

  if (section) {
    console.log(`  ${section}`);
    console.log("");
  }

  choices.forEach((choice, index) => {
    console.log(renderChoice(choice, index === selectedIndex));
  });

  drawKeybindings(footer);
}

function moveSelection(currentIndex, direction, itemCount) {
  if (itemCount <= 0) {
    return 0;
  }

  if (direction === "up") {
    return Math.max(0, currentIndex - 1);
  }

  if (direction === "down") {
    return Math.min(itemCount - 1, currentIndex + 1);
  }

  return currentIndex;
}

function isBackKey(key) {
  return key?.name === "escape" || key?.name === "q" || key?.name === "Q";
}

async function selectMenu({ title, subtitle, section, choices, selectedIndex = 0, footer = DEFAULT_KEYBINDINGS, onRender }) {
  enableKeyboard();

  try {
    while (true) {
      if (onRender) {
        onRender();
      } else {
        renderMenu({
          title,
          subtitle,
          section,
          choices,
          selectedIndex,
          footer,
        });
      }

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
        return {
          value: null,
          index: selectedIndex,
          action: "back",
        };
      }

      if (key.name === "return") {
        if (!choices.length) {
          continue;
        }

        return {
          value: choices[selectedIndex].value,
          choice: choices[selectedIndex],
          index: selectedIndex,
          action: "select",
        };
      }
    }
  } finally {
    disableKeyboard();
  }
}

module.exports = {
  DEFAULT_KEYBINDINGS,
  drawKeybindings,
  renderChoice,
  renderMenu,
  moveSelection,
  isBackKey,
  selectMenu,
};
