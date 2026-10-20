const fs = require("fs");
const path = require("path");

function createJavaScriptProject(projectPath) {
  const projectName = path.basename(projectPath);
  const htmlName = projectName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  const assetsPath = path.join(projectPath, "Assets");
  const cssPath = path.join(assetsPath, "Css");
  const jsPath = path.join(assetsPath, "JS");

  fs.mkdirSync(cssPath, { recursive: true });
  fs.mkdirSync(jsPath, { recursive: true });

  const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>${htmlName}</title>

    <link rel="stylesheet" href="Assets/Css/style.css" />

    <script
      src="Assets/JS/index.js"
      type="module"
    ></script>
  </head>

  <body>
    <main>
      <h1>${htmlName}</h1>
      <p>Your app is ready. Edit <code>Assets/JS/index.js</code> to get started.</p>
    </main>
  </body>
</html>
`;

  const cssContent = `body {
  font-family: sans-serif;
}
`;

  const jsContent = `console.log(${JSON.stringify(`${projectName} is ready`)});
`;

  fs.writeFileSync(path.join(projectPath, "index.html"), htmlContent);

  fs.writeFileSync(path.join(cssPath, "style.css"), cssContent);

  fs.writeFileSync(path.join(jsPath, "index.js"), jsContent);

  console.log("");
  console.log("JavaScript App project created.");
  console.log("");
}

module.exports = createJavaScriptProject;
