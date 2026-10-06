const { colors } = require("./colors");

function getWidth() {
  const columns = process.stdout.columns || 80;
  return Math.max(50, columns);
}

function drawHeader(title, subtitle = "") {
  const width = getWidth();

  console.clear();

  console.log(`${colors.brightCyan}╭${"─".repeat(width - 2)}╮${colors.reset}`);

  const titleText = `  ${title}`;

  console.log(`${colors.brightCyan}│${colors.reset}` + `${colors.brightPurple}${titleText}` + " ".repeat(Math.max(0, width - 2 - titleText.length)) + `${colors.brightCyan}│${colors.reset}`);

  if (subtitle) {
    const subtitleText = `  ${subtitle}`;

    console.log(`${colors.brightCyan}│${colors.reset}` + `${colors.gray}${subtitleText}` + " ".repeat(Math.max(0, width - 2 - subtitleText.length)) + `${colors.brightCyan}│${colors.reset}`);
  }

  console.log(`${colors.brightCyan}╰${"─".repeat(width - 2)}╯${colors.reset}`);

  console.log("");
}

function drawSection(title) {
  const width = getWidth();
  const lineLength = Math.max(0, width - title.length - 5);

  console.log(`${colors.gray}┌─ ${title} ${"─".repeat(lineLength)}┐${colors.reset}`);
}

function drawFooter(text = "DevTool") {
  console.log("");
  console.log(`${colors.gray}${text}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.brightGreen}✓ ${message}${colors.reset}`);
}

function error(message) {
  console.log(`${colors.brightRed}✗ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.gray}${message}${colors.reset}`);
}

module.exports = {
  drawHeader,
  drawSection,
  drawFooter,
  success,
  error,
  info,
};
