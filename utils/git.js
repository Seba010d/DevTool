const { execFileSync } = require("child_process");

function git(projectPath, args) {
  try {
    return execFileSync("git", args, { cwd: projectPath, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch (error) {
    throw new Error((error.stderr || error.message || "Git command failed").trim());
  }
}
function gitStatus(projectPath) {
  try {
    console.log("\n" + git(projectPath, ["status", "--short", "--branch"]));
  } catch (e) {
    console.log(`\n${e.message}\n`);
  }
}
async function gitAction(projectPath, action, input) {
  try {
    if (action === "status") return gitStatus(projectPath);
    if (action === "add") {
      git(projectPath, ["add", "-A"]);
      console.log("All changes staged.");
    }
    if (action === "commit") {
      const message = await input({ message: "Commit message:" });
      if (!message.trim()) return console.log("Commit cancelled: message is required.");
      console.log(git(projectPath, ["commit", "-m", message.trim()]));
    }
    if (action === "push" || action === "pull") console.log(git(projectPath, [action]));
  } catch (e) {
    console.log(`\n${e.message}\n`);
  }
}
module.exports = { gitStatus, gitAction };
