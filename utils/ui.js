const { colors } = require("./colors");

function getWidth() {
  return Math.max(process.stdout.columns || 80, 20);
}

function stripAnsi(value) {
  return String(value).replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
}

function getDisplayWidth(value) {
  let width = 0;

  for (const char of stripAnsi(value)) {
    const code = char.codePointAt(0);
    width += (code >= 0x1100 && code <= 0x115f) || (code >= 0x2329 && code <= 0x232a) || (code >= 0x2e80 && code <= 0xa4cf) || (code >= 0xac00 && code <= 0xd7a3) || (code >= 0xf900 && code <= 0xfaff) || (code >= 0xfe10 && code <= 0xfe6f) || (code >= 0xff00 && code <= 0xff60) || (code >= 0x1f300 && code <= 0x1faff) ? 2 : 1;
  }

  return width;
}

function padText(value, width) {
  return value + " ".repeat(Math.max(0, width - getDisplayWidth(value)));
}

function truncateText(value, width) {
  if (getDisplayWidth(value) <= width) return value;
  if (width <= 1) return "…";

  let result = "";
  let visibleWidth = 0;
  for (const char of value) {
    const charWidth = getDisplayWidth(char);
    if (visibleWidth + charWidth > width - 1) break;
    result += char;
    visibleWidth += charWidth;
  }

  return `${result}…`;
}

function drawHeader(title, subtitle = "") {
  const width = getWidth();
  const insideWidth = width - 4;
  const pageTitle = title.replace(/^DEVTOOL\s*\/?\s*/i, "") || subtitle || "Project launcher";
  const headerText = truncateText(`◈  DEVTOOL  /  ${pageTitle.toUpperCase()}`, insideWidth);
  const top = `${colors.gray}╭${"─".repeat(width - 2)}╮${colors.reset}`;
  const bottom = `${colors.gray}╰${"─".repeat(width - 2)}╯${colors.reset}`;

  console.clear();
  console.log("");
  console.log(top);
  console.log(`${colors.gray}│${colors.reset} ${padText(`${colors.brightCyan}\x1b[1m${headerText}\x1b[0m`, insideWidth)} ${colors.gray}│${colors.reset}`);

  if (subtitle && pageTitle.toLowerCase() !== subtitle.toLowerCase()) {
    console.log(`${colors.gray}│${colors.reset} ${padText(`${colors.gray}${truncateText(subtitle, insideWidth)}${colors.reset}`, insideWidth)} ${colors.gray}│${colors.reset}`);
  }

  console.log(bottom);
  console.log("");
}

function drawProjectRow({ selected = false, icon = "📁", name, meta = "" }) {
  const pointer = selected ? `${colors.brightCyan}▶${colors.reset}` : " ";
  const label = `${icon}  ${name}`;
  const contentWidth = getWidth() - 6;
  const metaWidth = getDisplayWidth(meta);
  const gap = Math.max(2, contentWidth - getDisplayWidth(pointer) - getDisplayWidth(label) - metaWidth - 2);
  const line = `${pointer}  ${label}${" ".repeat(gap)}${colors.gray}${meta}${colors.reset}`;
  console.log(`${colors.gray}│${colors.reset} ${padText(line, getWidth() - 4)} ${colors.gray}│${colors.reset}`);
}

function drawDivider() {
  console.log(`${colors.gray}├${"─".repeat(getWidth() - 2)}┤${colors.reset}`);
}

function drawSection(title) {
  const width = getWidth();
  const visibleTitle = truncateText(title, width - 8);
  const lineLength = Math.max(1, width - getDisplayWidth(visibleTitle) - 5);
  console.log(`${colors.gray}╭─ ${colors.brightCyan}${visibleTitle}${colors.gray} ${"─".repeat(lineLength)}╮${colors.reset}`);
}

function drawFooter(text = "DevTool") {
  console.log("");
  console.log(`${colors.gray}  ${text}${colors.reset}`);
  console.log("");
}

function drawStatus(kind, message) {
  console.log("");
  const isSuccess = kind === "SUCCESS";
  const color = isSuccess ? colors.brightGreen : colors.brightRed;
  const symbol = isSuccess ? "✓" : "✕";
  console.log(`${color}  ${symbol}  ${kind.padEnd(7)} ${message}${colors.reset}`);
  console.log("");
}

function success(message) { drawStatus("SUCCESS", message); }

function error(message) { drawStatus("ERROR", message); }

function info(message) {
  console.log(`${colors.gray}  ${message}${colors.reset}`);
}

module.exports = { getWidth, getDisplayWidth, padText, truncateText, drawHeader, drawProjectRow, drawDivider, drawSection, drawFooter, success, error, info };
