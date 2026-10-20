const fs = require("fs");
const path = require("path");

function createExpressProject(projectPath) {
  const displayName = path.basename(projectPath);
  const projectName = displayName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "express-project";

  const packageJson = {
    name: projectName,
    version: "1.0.0",
    private: true,
    main: "server.js",
    scripts: {
      start: "node server.js",
    },
    dependencies: {
      express: "^5.1.0",
    },
  };

  const serverContent = `const express = require("express");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello from " + ${JSON.stringify(displayName)} + "!" });
});

app.get("/api", (req, res) => {
  res.json({
    message: "API is working",
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

  fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");

  fs.writeFileSync(path.join(projectPath, "server.js"), serverContent);

  console.log("");
  console.log("Node.js + Express project created.");
  console.log("");
}

module.exports = createExpressProject;
