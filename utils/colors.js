const baseColors = {
  reset: "\x1b[0m",
  brightCyan: "\x1b[96m",
  brightPurple: "\x1b[95m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightRed: "\x1b[91m",
  brightBlue: "\x1b[94m",
  cyan: "\x1b[36m",
  purple: "\x1b[35m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
};

const themes = {
  ocean: {
    name: "Ocean",
    colors: { brightCyan: "\x1b[96m", cyan: "\x1b[36m", brightPurple: "\x1b[95m", purple: "\x1b[35m", brightGreen: "\x1b[92m", green: "\x1b[32m", brightYellow: "\x1b[93m", yellow: "\x1b[33m", brightRed: "\x1b[91m", red: "\x1b[31m", brightBlue: "\x1b[94m", blue: "\x1b[34m" },
  },
  forest: {
    name: "Forest",
    colors: { brightCyan: "\x1b[92m", cyan: "\x1b[32m", brightPurple: "\x1b[96m", purple: "\x1b[36m", brightGreen: "\x1b[92m", green: "\x1b[32m", brightYellow: "\x1b[93m", yellow: "\x1b[33m", brightRed: "\x1b[91m", red: "\x1b[31m", brightBlue: "\x1b[94m", blue: "\x1b[34m" },
  },
  sunset: {
    name: "Sunset",
    colors: { brightCyan: "\x1b[93m", cyan: "\x1b[33m", brightPurple: "\x1b[91m", purple: "\x1b[31m", brightGreen: "\x1b[92m", green: "\x1b[32m", brightYellow: "\x1b[95m", yellow: "\x1b[35m", brightRed: "\x1b[91m", red: "\x1b[31m", brightBlue: "\x1b[96m", blue: "\x1b[36m" },
  },
  monochrome: {
    name: "Monochrome",
    colors: { brightCyan: "\x1b[97m", cyan: "\x1b[37m", brightPurple: "\x1b[97m", purple: "\x1b[37m", brightGreen: "\x1b[97m", green: "\x1b[37m", brightYellow: "\x1b[97m", yellow: "\x1b[37m", brightRed: "\x1b[97m", red: "\x1b[37m", brightBlue: "\x1b[97m", blue: "\x1b[37m" },
  },
};

const colors = { ...baseColors };

function applyTheme(themeId = "ocean") {
  const theme = themes[themeId] || themes.ocean;
  Object.assign(colors, baseColors, theme.colors);
  return themeId in themes ? themeId : "ocean";
}

module.exports = { colors, themes, applyTheme };
