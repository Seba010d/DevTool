const fs = require("fs");
const path = require("path");

function createNodeProject(projectPath) {
  const packageJson = {
    name: path.basename(projectPath).toLowerCase(),
    version: "1.0.0",
    main: "index.js",
    scripts: {
      start: "node index.js",
    },
  };

  const indexContent = `console.log("Hello from ${path.basename(projectPath)}!");\n`;

  fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2));

  fs.writeFileSync(path.join(projectPath, "index.js"), indexContent);

  console.log("");
  console.log("Node.js project created.");
  console.log("");
}

module.exports = createNodeProject;
