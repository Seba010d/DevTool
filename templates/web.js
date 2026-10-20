const fs = require("fs");
const path = require("path");

module.exports = function createWeb(projectPath, scss = false) {
  const projectName = path.basename(projectPath);
  const htmlName = projectName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  const packageName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "web-project";
  const cssPath = path.join(projectPath, "Assets", "Css");
  fs.mkdirSync(cssPath, { recursive: true });

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A new website built with ${htmlName}." />
    <title>${htmlName}</title>
    <link rel="stylesheet" href="Assets/Css/style.css" />
    <script src="index.js" defer></script>
  </head>
  <body>
    <main>
      <h1>${htmlName}</h1>
      <p>Your new website is ready. Start editing <code>index.html</code>.</p>
    </main>
  </body>
</html>
`;
  const css = `:root { font-family: system-ui, sans-serif; color: #202124; background: #f7f8fa; }
body { min-height: 100vh; margin: 0; display: grid; place-items: center; }
main { max-width: 42rem; padding: 2rem; }
h1 { margin-bottom: 0.5rem; }
`;

  fs.writeFileSync(path.join(projectPath, "index.html"), html);
  fs.writeFileSync(path.join(projectPath, "index.js"), `console.log(${JSON.stringify(`${projectName} is ready`)});\n`);
  fs.writeFileSync(path.join(cssPath, "style.css"), css);

  if (scss) {
    fs.mkdirSync(path.join(projectPath, "scss"), { recursive: true });
    fs.writeFileSync(path.join(projectPath, "scss", "style.scss"), `:root {\n  font-family: system-ui, sans-serif;\n  color: #202124;\n  background: #f7f8fa;\n}\n\nbody { min-height: 100vh; margin: 0; display: grid; place-items: center; }\nmain { max-width: 42rem; padding: 2rem; }\n`);
    fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify({
      name: packageName,
      version: "1.0.0",
      private: true,
      scripts: { build: "sass scss/style.scss Assets/Css/style.css", watch: "sass --watch scss/style.scss:Assets/Css/style.css" },
      devDependencies: { sass: "^1.0.0" },
    }, null, 2) + "\n");
  }
};
