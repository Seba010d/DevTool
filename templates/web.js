const fs = require("fs");
const path = require("path");
module.exports = function createWeb(projectPath, scss = false) {
  fs.writeFileSync(path.join(projectPath, "index.html"), `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${path.basename(projectPath)}</title><link rel="stylesheet" href="style.css"></head><body><h1>${path.basename(projectPath)}</h1><script src="index.js"></script></body></html>\n`);
  fs.writeFileSync(path.join(projectPath, "index.js"), `console.log("${path.basename(projectPath)} ready");\n`);
  if (scss) {
    fs.mkdirSync(path.join(projectPath, "scss"), { recursive: true });
    fs.writeFileSync(path.join(projectPath, "scss", "style.scss"), "body { font-family: sans-serif; }\n");
    fs.writeFileSync(
      path.join(projectPath, "package.json"),
      JSON.stringify(
        {
          name: path
            .basename(projectPath)
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-"),
          version: "1.0.0",
          scripts: { build: "sass scss/style.scss style.css" },
          devDependencies: { sass: "^1.0.0" },
        },
        null,
        2,
      ) + "\n",
    );
  } else fs.writeFileSync(path.join(projectPath, "style.css"), "body { font-family: sans-serif; }\n");
};
