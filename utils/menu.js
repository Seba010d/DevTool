const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");

const DEFAULT_KEYBINDINGS = "↑↓ Navigate    Enter Select    Q Back";

function getDisplayWidth(value) {
  let width = 0;

  for (const char of value) {
    const code = char.codePointAt(0);

    if ((code >= 0x1100 && code <= 0x115f) || (code >= 0x2329 && code <= 0x232a) || (code >= 0x2e80 && code <= 0x303e) || (code >= 0x3040 && code <= 0xa4cf) || (code >= 0xac00 && code <= 0xd7a3) || (code >= 0xf900 && code <= 0xfaff) || (code >= 0xfe10 && code <= 0xfe19) || (code >= 0xfe30 && code <= 0xfe6f) || (code >= 0xff00 && code <= 0xff60) || (code >= 0xffe0 && code <= 0xffe6) || (code >= 0x1f300 && code <= 0x1faff)) {
      width += 2;
    } else {
      width += 1;
    }
  }

  return width;
}

function padDisplayWidth(value, width) {
  const currentWidth = getDisplayWidth(value);

  if (currentWidth >= width) {
    return value;
  }

  return value + " ".repeat(width - currentWidth);
}

function drawKeybindings(bindings = DEFAULT_KEYBINDINGS) {
  console.log("");

  console.log("─".repeat(Math.min(Math.max(process.stdout.columns || 80, 60), 90)));

  console.log("");

  console.log(`  ${bindings}`);
}

function renderChoice(choice, selected) {
  const pointer = selected ? "❯" : " ";
  const icon = choice.icon || "";

  const iconColumn = padDisplayWidth(icon, 2);

  return `${pointer}  ${iconColumn}  ${choice.name}`;
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
  getDisplayWidth,
  padDisplayWidth,
  drawKeybindings,
  renderChoice,
  renderMenu,
  moveSelection,
  isBackKey,
  selectMenu,
};
