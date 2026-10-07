const { colors } = require("./colors");

function getWidth() {
  const columns = process.stdout.columns || 80;

  return Math.min(Math.max(columns, 70), 100);
}

function stripAnsi(value) {
  return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

function padText(value, width) {
  const visibleLength = stripAnsi(value).length;

  return value + " ".repeat(Math.max(0, width - visibleLength));
}

function drawHeader(title, subtitle = "") {
  const width = getWidth();
  const innerWidth = width - 4;

  console.clear();

  console.log("");
  console.log(`${colors.gray}┌${"─".repeat(width - 2)}┐${colors.reset}`);

  const titleLine = `  ${colors.brightCyan}${title}${colors.reset}`;

  console.log(`${colors.gray}│${colors.reset}${padText(titleLine, width - 2)}${colors.gray}│${colors.reset}`);

  if (subtitle) {
    const subtitleLine = `  ${colors.gray}${subtitle}${colors.reset}`;

    console.log(`${colors.gray}│${colors.reset}${padText(subtitleLine, width - 2)}${colors.gray}│${colors.reset}`);
  }

  console.log(`${colors.gray}└${"─".repeat(width - 2)}┘${colors.reset}`);

  console.log("");
}

function drawProjectRow({ selected = false, icon = "📁", name, meta = "" }) {
  const width = getWidth();
  const innerWidth = width - 4;

  const prefix = selected ? `${colors.brightCyan}❯${colors.reset} ` : "  ";

  const projectName = `${icon}  ${name}`;
  const visibleProjectName = stripAnsi(projectName);

  const availableMetaWidth = Math.max(10, innerWidth - visibleProjectName.length - 7);

  const truncatedMeta = meta.length > availableMetaWidth ? `${meta.slice(0, availableMetaWidth - 1)}…` : meta;

  const line = `${prefix}${projectName}${" ".repeat(Math.max(2, innerWidth - visibleProjectName.length - truncatedMeta.length - 2))}${colors.gray}${truncatedMeta}${colors.reset}`;

  if (selected) {
    console.log(`${colors.cyan}│${colors.reset} ${line} ${colors.cyan}│${colors.reset}`);
  } else {
    console.log(`${colors.gray}│${colors.reset} ${line} ${colors.gray}│${colors.reset}`);
  }
}

function drawDivider() {
  const width = getWidth();

  console.log(`${colors.gray}├${"─".repeat(width - 2)}┤${colors.reset}`);
}

function drawSection(title) {
  const width = getWidth();
  const lineLength = Math.max(5, width - title.length - 7);

  console.log(`${colors.gray}┌─ ${colors.brightCyan}${title}${colors.gray} ${"─".repeat(lineLength)}┐${colors.reset}`);
}

function drawFooter(text = "DevTool") {
  console.log("");
  console.log(`${colors.gray}  ${text}${colors.reset}`);
  console.log("");
}

function success(message) {
  console.log("");
  console.log(`${colors.brightGreen}  ✓ ${message}${colors.reset}`);
  console.log("");
}

function error(message) {
  console.log("");
  console.log(`${colors.brightRed}  ✗ ${message}${colors.reset}`);
  console.log("");
}

function info(message) {
  console.log(`${colors.gray}  ${message}${colors.reset}`);
}

module.exports = {
  getWidth,
  drawHeader,
  drawProjectRow,
  drawDivider,
  drawSection,
  drawFooter,
  success,
  error,
  info,
};
