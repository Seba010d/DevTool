const readline = require("readline");

readline.emitKeypressEvents(process.stdin);

let rawModeEnabled = false;

function enableKeyboard() {
  if (rawModeEnabled) return;

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.resume();
  process.stdout.write("\x1b[?25l");

  rawModeEnabled = true;
}

function disableKeyboard() {
  if (!rawModeEnabled) return;

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }

  process.stdin.resume();
  process.stdout.write("\x1b[?25h");

  rawModeEnabled = false;
}

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function waitForKey() {
  return new Promise((resolve) => {
    let buffer = "";
    let escapeTimer = null;

    const cleanup = () => {
      process.stdin.removeListener("data", onData);

      if (escapeTimer) {
        clearTimeout(escapeTimer);
        escapeTimer = null;
      }
    };

    const finish = (key) => {
      cleanup();
      resolve(key);
    };

    const parseBuffer = () => {
      if (!buffer) return;

      if (buffer === "\r" || buffer === "\n") {
        finish({
          name: "return",
          value: "\r",
        });
        return;
      }

      if (buffer === "\x03") {
        finish({
          name: "ctrl+c",
          value: "\x03",
        });
        return;
      }

      if (buffer === "\x1b[A") {
        finish({
          name: "up",
          value: "up",
        });
        return;
      }

      if (buffer === "\x1b[B") {
        finish({
          name: "down",
          value: "down",
        });
        return;
      }

      if (buffer === "\x1b[C") {
        finish({
          name: "right",
          value: "right",
        });
        return;
      }

      if (buffer === "\x1b[D") {
        finish({
          name: "left",
          value: "left",
        });
        return;
      }

      if (buffer === "\x1b") {
        escapeTimer = setTimeout(() => {
          finish({
            name: "escape",
            value: "escape",
          });
        }, 10);

        return;
      }

      if (buffer.startsWith("\x1b")) {
        finish({
          name: "escape",
          value: "escape",
        });
        return;
      }

      finish({
        name: buffer,
        value: buffer,
      });
    };

    const onData = (data) => {
      buffer += data.toString();
      parseBuffer();
    };

    process.stdin.on("data", onData);
  });
}

async function getKey() {
  return waitForKey();
}

module.exports = {
  enableKeyboard,
  disableKeyboard,
  clearScreen,
  waitForKey,
  getKey,
};
