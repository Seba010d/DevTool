const fs = require("fs");
const path = require("path");

function createNodeProject(projectPath) {
  const projectName = path.basename(projectPath);
  const packageJson = {
    name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "node-project",
    version: "1.0.0",
    private: true,
    main: "index.js",
    scripts: {
      start: "node index.js",
    },
  };

  const indexContent = `const projectName = ${JSON.stringify(projectName)};\nconsole.log("Hello from " + projectName + "!");\n`;

  fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");

  fs.writeFileSync(path.join(projectPath, "index.js"), indexContent);

  console.log("");
  console.log("Node.js project created.");
  console.log("");
}

module.exports = createNodeProject;
