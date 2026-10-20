const fs = require("fs");
const path = require("path");

module.exports = function createTypeScriptProject(projectPath) {
  fs.mkdirSync(path.join(projectPath, "src"), { recursive: true });
  const packageName = path.basename(projectPath).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify({
    name: packageName,
    version: "1.0.0",
    private: true,
    scripts: { start: "tsx src/index.ts", typecheck: "tsc --noEmit" },
    devDependencies: { tsx: "^4.19.0", typescript: "^5.7.0" },
  }, null, 2) + "\n");
  fs.writeFileSync(path.join(projectPath, "tsconfig.json"), JSON.stringify({
    compilerOptions: { target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", strict: true, skipLibCheck: true },
    include: ["src/**/*.ts"],
  }, null, 2) + "\n");
  fs.writeFileSync(path.join(projectPath, "src", "index.ts"), `const projectName: string = ${JSON.stringify(path.basename(projectPath))};\nconsole.log("Hello from " + projectName + "!");\n`);
};
