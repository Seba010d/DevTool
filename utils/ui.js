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
  const top = `${colors.gray}╭${"─".repeat(width - 2)}╮${colors.reset}`;
  const bottom = `${colors.gray}╰${"─".repeat(width - 2)}╯${colors.reset}`;
  const divider = `${colors.gray}├${"─".repeat(width - 2)}┤${colors.reset}`;
  const brand = `◈  ${colors.brightCyan}\x1b[1mDEVTOOL${colors.reset}`;
  const brandTag = width >= 60 ? `${colors.gray}PROJECT WORKSPACE${colors.reset}` : "";
  const brandGap = Math.max(1, insideWidth - getDisplayWidth(brand) - getDisplayWidth(brandTag));
  const brandLine = `${colors.gray}│${colors.reset} ${brand}${" ".repeat(brandGap)}${brandTag} ${colors.gray}│${colors.reset}`;
  const pageLine = `${colors.gray}│${colors.reset} ${padText(`${colors.brightWhite || colors.white}\x1b[1m${truncateText(pageTitle.toUpperCase(), insideWidth)}${colors.reset}`, insideWidth)} ${colors.gray}│${colors.reset}`;

  console.clear();
  console.log("");
  console.log(top);
  console.log(brandLine);
  console.log(divider);
  console.log(pageLine);

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
  const width = getWidth();
  const innerWidth = width - 4;
  console.log("");
  const isSuccess = kind === "SUCCESS";
  const color = isSuccess ? colors.brightGreen : colors.brightRed;
  const symbol = isSuccess ? "✓" : "✕";
  const label = `${symbol}  ${kind}`;
  const headerFill = "─".repeat(Math.max(1, width - getDisplayWidth(label) - 4));
  console.log(`${color}╭─ ${label}${colors.gray}${headerFill}╮${colors.reset}`);

  const lines = [];
  let line = "";
  for (const char of String(message)) {
    if (char === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    if (getDisplayWidth(line + char) > innerWidth) {
      lines.push(line);
      line = char.trim() ? char : "";
      continue;
    }
    line += char;
  }
  if (line) lines.push(line);

  for (const messageLine of lines) {
    const visibleLine = truncateText(messageLine, innerWidth);
    console.log(`${colors.gray}│${colors.reset} ${padText(`${color}${visibleLine}${colors.reset}`, innerWidth)} ${colors.gray}│${colors.reset}`);
  }

  console.log(`${color}╰${"─".repeat(width - 2)}╯${colors.reset}`);
  console.log("");
}

function success(message) { drawStatus("SUCCESS", message); }

function error(message) { drawStatus("ERROR", message); }

function info(message) {
  console.log(`${colors.gray}  ${message}${colors.reset}`);
}

module.exports = { getWidth, getDisplayWidth, padText, truncateText, drawHeader, drawProjectRow, drawDivider, drawSection, drawFooter, success, error, info };
