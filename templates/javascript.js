const fs = require("fs");
const path = require("path");

function createJavaScriptProject(projectPath) {
  const assetsPath = path.join(projectPath, "Assets");
  const cssPath = path.join(assetsPath, "Css");
  const jsPath = path.join(assetsPath, "JS");
  const imagesPath = path.join(assetsPath, "Images");

  fs.mkdirSync(cssPath, { recursive: true });
  fs.mkdirSync(jsPath, { recursive: true });
  fs.mkdirSync(imagesPath, { recursive: true });

  const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>${path.basename(projectPath)}</title>

    <link rel="stylesheet" href="Assets/Css/style.css" />

    <script
      src="Assets/JS/index.js"
      type="module"
    ></script>
  </head>

  <body>
    <main>
      <h1>${path.basename(projectPath)}</h1>
    </main>
  </body>
</html>
`;

  const cssContent = `body {
  font-family: sans-serif;
}
`;

  const jsContent = `console.log("${path.basename(projectPath)} ready");
`;

  fs.writeFileSync(path.join(projectPath, "index.html"), htmlContent);

  fs.writeFileSync(path.join(cssPath, "style.css"), cssContent);

  fs.writeFileSync(path.join(jsPath, "index.js"), jsContent);

  console.log("");
  console.log("JavaScript App project created.");
  console.log("");
}

module.exports = createJavaScriptProject;
