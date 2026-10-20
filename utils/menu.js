const { enableKeyboard, disableKeyboard, clearScreen, waitForKey } = require("./keyboard");
const { drawHeader, getWidth, truncateText } = require("./ui");
const { colors } = require("./colors");

const DEFAULT_KEYBINDINGS = "↑↓ Navigate    Enter Select    Q Back";

function getDisplayWidth(value) {
  let width = 0;
  value = value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");

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
  const keyNames = /^(↑↓|Enter|Return|Q|Esc|Escape|\/|Ctrl\+C|Any key|Press any key)(?=\s|$)/i;
  const visibleBindings = bindings
    .split(/\s{2,}/)
    .map((binding) => {
      const match = binding.match(keyNames);
      if (!match) return `${colors.gray}${binding}${colors.reset}`;
      const key = match[0];
      const label = binding.slice(key.length).trim();
      return `${colors.brightYellow}\x1b[1m${key}\x1b[0m${label ? ` ${colors.gray}${label}${colors.reset}` : ""}`;
    })
    .join(`   ${colors.gray}·${colors.reset}   `);

  console.log("");
  console.log(`  ${colors.gray}${"─".repeat(Math.max(1, getWidth() - 4))}${colors.reset}`);
  console.log(`  ${visibleBindings}`);
}

function renderChoice(choice, selected) {
  const pointer = selected ? `${colors.brightCyan}▶${colors.reset}` : " ";
  const icon = choice.icon || "";
  const iconColumn = padDisplayWidth(icon, 2);
  const iconColor = choice.iconColor || (selected ? colors.brightCyan : "");
  const styledIcon = iconColor ? `${iconColor}${iconColumn}${colors.reset}` : iconColumn;
  const showMetadata = getWidth() >= 54;
  const availableNameWidth = Math.max(1, getWidth() - getDisplayWidth(`${pointer}  ${iconColumn}  `) - (showMetadata && (choice.meta || choice.recent) ? Math.max(12, Math.floor(getWidth() * 0.28)) : 3));
  const visibleName = truncateText(choice.name, availableNameWidth);
  const name = selected ? `${colors.brightYellow}\x1b[1m${visibleName}\x1b[0m` : visibleName;
  const styledMeta = showMetadata && choice.meta
    ? `${choice.meta === "Folder" ? colors.brightBlue : choice.meta === "Project" ? colors.brightGreen : colors.brightCyan}${choice.meta}${colors.reset}`
    : "";
  const recentLabel = showMetadata && choice.recent ? `${colors.gray}· Recent${colors.reset}` : "";
  const metadata = [styledMeta, recentLabel].filter(Boolean).join("  ");
  const metaWidth = getDisplayWidth(metadata);
  const meta = metadata ? `${" ".repeat(Math.max(2, getWidth() - 4 - getDisplayWidth(`${pointer}  ${iconColumn}  ${visibleName}`) - metaWidth))}${metadata}` : "";
  return `${pointer}  ${styledIcon}  ${name}${meta}`;
}

function renderChoiceList({ section, choices, selectedIndex = 0, emptyMessage = "No items to show." }) {
  const width = getWidth();
  const title = section || "OPTIONS";
  const count = choices.length ? `${selectedIndex + 1} / ${choices.length}` : "0 items";
  const visibleTitle = truncateText(title, Math.max(1, width - getDisplayWidth(count) - 10));
  const topLabel = `╭─ ${visibleTitle} ${"─".repeat(Math.max(1, width - getDisplayWidth(visibleTitle) - getDisplayWidth(count) - 7))} ${count}─╮`;
  console.log(`${colors.gray}${topLabel}${colors.reset}`);

  const extraRows = Math.max(0, (process.stdout.rows || 24) - choices.length - 11);
  const topPadding = Math.floor(extraRows / 2);
  const bottomPadding = extraRows - topPadding;
  const blankRow = `${colors.gray}│${colors.reset}${" ".repeat(width - 2)}${colors.gray}│${colors.reset}`;
  for (let row = 0; row < topPadding; row += 1) console.log(blankRow);

  if (!choices.length) {
    const visibleMessage = truncateText(emptyMessage, width - 4);
    console.log(`${colors.gray}│${colors.reset} ${visibleMessage}${" ".repeat(Math.max(0, width - getDisplayWidth(visibleMessage) - 3))}${colors.gray}│${colors.reset}`);
  } else {
    choices.forEach((choice, index) => {
      const rendered = renderChoice(choice, index === selectedIndex);
      const innerWidth = width - 4;
      const content = getDisplayWidth(rendered) > innerWidth ? rendered : `${rendered}${" ".repeat(innerWidth - getDisplayWidth(rendered))}`;
      console.log(`${colors.gray}│${colors.reset} ${content} ${colors.gray}│${colors.reset}`);
    });
  }

  for (let row = 0; row < bottomPadding; row += 1) console.log(blankRow);

  console.log(`${colors.gray}╰${"─".repeat(width - 2)}╯${colors.reset}`);
}

function renderMenu({ title, subtitle, section, choices, selectedIndex = 0, header, footer = DEFAULT_KEYBINDINGS }) {
  clearScreen();

  if (header) {
    header();
  } else {
    drawHeader(title, subtitle);
  }

  renderChoiceList({ section, choices, selectedIndex });

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
        onRender(selectedIndex);
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
  selectMenu,
  renderMenu,
  renderChoice,
  renderChoiceList,
  drawKeybindings,
  moveSelection,
  isBackKey,
  getDisplayWidth,
  padDisplayWidth,
};
