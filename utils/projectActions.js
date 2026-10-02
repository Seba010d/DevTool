const fs = require("fs");
const path = require("path");
const { select, confirm, input } = require("@inquirer/prompts");
const { execFile } = require("child_process");
const runProject = require("./projectRunner");
const { gitAction } = require("./git");
const { loadConfig } = require("./config");

function openApp(app, args, cwd) {
  execFile(app, args, { cwd }, (err) => {
    if (err) console.log(`Could not open ${app}: ${err.message}`);
  });
}
async function projectActions(projectPath) {
  while (true) {
    const projectName = path.basename(projectPath);
    const actions = [{ name: "Project information", value: "info" }, { name: "Open project…", value: "open" }, ...(fs.existsSync(path.join(projectPath, "package.json")) ? [{ name: "Install dependencies (npm install)", value: "install" }] : []), { name: "Git", value: "git" }, { name: "Rename project", value: "rename" }, { name: "Delete project", value: "delete" }, { name: "← Go back", value: "back" }];
    const action = await select({ message: `What do you want to do with ${projectName}?`, choices: actions, loop: false });
    if (action === "back") return;
    if (action === "info") {
      let pkg = {};
      try {
        pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));
      } catch {}
      let node = "Not installed";
      try {
        node = require("child_process").execFileSync("node", ["--version"], { encoding: "utf8" }).trim();
      } catch {}
      let isGit = false;
      try {
        require("child_process").execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: projectPath, stdio: "ignore" });
        isGit = true;
      } catch {}
      const metaPath = path.join(projectPath, ".devtool.json");
      let meta = {};
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      } catch {}
      console.log(`\nName: ${projectName}\nPath: ${projectPath}\nTemplate: ${meta.template || "Unknown"}\nNode version: ${node}\nGit repository: ${isGit ? "Yes" : "No"}\nDependencies: ${pkg.dependencies ? Object.keys(pkg.dependencies).join(", ") : "None listed"}\n`);
      await input({ message: "Press Enter to continue" });
      continue;
    }
    if (action === "open") {
      const a = await select({
        message: `Open ${projectName}`,
        choices: [
          { name: "Finder", value: "finder" },
          { name: "VS Code", value: "vscode" },
          { name: "Ghostty", value: "terminal" },
          { name: "Run project", value: "run" },
          { name: "← Back", value: "back" },
        ],
        loop: false,
      });
      if (a === "finder") openApp("open", [projectPath], projectPath);
      if (a === "vscode") openApp("code", [projectPath], projectPath);
      if (a === "terminal") openApp("open", ["-a", "Ghostty", projectPath], projectPath);
      if (a === "run") runProject(projectPath);
      continue;
    }
    if (action === "install") {
      const { spawn } = require("child_process");
      const child = spawn("npm", ["install"], { cwd: projectPath, stdio: "inherit" });
      await new Promise((resolve) =>
        child.on("close", (code) => {
          console.log(code === 0 ? "\nDependencies installed." : `\nnpm install exited with code ${code}.`);
          resolve();
        }),
      );
      await input({ message: "Press Enter to continue" });
      continue;
    }
    if (action === "git") {
      const g = await select({
        message: `Git — ${projectName}`,
        choices: [
          { name: "Status", value: "status" },
          { name: "Add changes", value: "add" },
          { name: "Commit", value: "commit" },
          { name: "Push", value: "push" },
          { name: "Pull", value: "pull" },
          { name: "← Back", value: "back" },
        ],
        loop: false,
      });
      if (g !== "back") {
        await gitAction(projectPath, g, input);
        await input({ message: "Press Enter to continue" });
      }
      continue;
    }
    if (action === "rename") {
      const n = (await input({ message: "New project name:", default: projectName })).trim();
      if (!n || n === projectName) continue;
      const dest = path.join(path.dirname(projectPath), n);
      if (fs.existsSync(dest)) {
        console.log("That name already exists.");
        continue;
      }
      fs.renameSync(projectPath, dest);
      projectPath = dest;
      continue;
    }
    if (action === "delete") {
      if (await confirm({ message: `Delete ${projectName}?`, default: false })) {
        fs.rmSync(projectPath, { recursive: true, force: true });
        return;
      }
    }
  }
}
module.exports = projectActions;
