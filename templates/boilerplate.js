const fs = require("fs");
const path = require("path");

function createBoilerplateProject(projectPath) {
  const assetsPath = path.join(projectPath, "Assets");
  const cssPath = path.join(assetsPath, "Css");
  const jsPath = path.join(assetsPath, "JS");
  const modulesPath = path.join(jsPath, "modules");
  const scssPath = path.join(projectPath, "scss");

  fs.mkdirSync(cssPath, { recursive: true });
  fs.mkdirSync(modulesPath, { recursive: true });
  fs.mkdirSync(scssPath, { recursive: true });

  const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${path.basename(projectPath)}</title>

    <link rel="stylesheet" href="Assets/Css/Style.css" />

    <script src="Assets/JS/index.js" type="module"></script>
  </head>

  <body>
    <main>
      <h1>${path.basename(projectPath)}</h1>
      <p>Your project is ready. Edit this page and the files in Assets.</p>
    </main>
  </body>
</html>
`;

  const cssContent = `:root {\n  font-family: system-ui, sans-serif;\n  color: #202124;\n  background: #f7f8fa;\n}\n\nbody { min-height: 100vh; margin: 0; }\nmain { max-width: 64rem; margin: 0 auto; padding: 2rem; }\n`;

  const jsContent = `const heading = document.querySelector("h1");
if (heading) {
  console.log(heading.textContent + " is ready");
}
`;

  const localStorageContent = `const myDataName = "Data";

export function saveData(data) {
  localStorage.setItem(myDataName, JSON.stringify(data));
}

export function loadData() {
  const data = localStorage.getItem(myDataName);

  if (!data) {
    console.warn("Ingen data fundet i localStorage!");
    return null;
  }

  return JSON.parse(data);
}
`;

  const scssContent = `@use "reset";

:root {
  font-family: system-ui, sans-serif;
  color: #202124;
  background: #f7f8fa;
}

body {
  min-height: 100vh;
  margin: 0;
}

main {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem;
}
`;

  const resetContent = `html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  display: block;
}

body {
  line-height: 1;
}

ol,
ul {
  list-style: none;
}

blockquote,
q {
  quotes: none;
}

blockquote::before,
blockquote::after {
  content: "";
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}
`;

  fs.writeFileSync(path.join(projectPath, "Index.html"), htmlContent);
  fs.writeFileSync(path.join(cssPath, "Style.css"), cssContent);
  fs.writeFileSync(path.join(jsPath, "index.js"), jsContent);
  fs.writeFileSync(path.join(modulesPath, "localStorage.js"), localStorageContent);
  fs.writeFileSync(path.join(scssPath, "style.scss"), scssContent);
  fs.writeFileSync(path.join(scssPath, "_reset.scss"), resetContent);
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(
      {
        name: path
          .basename(projectPath)
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-"),
        version: "1.0.0",
        scripts: { build: "sass scss/style.scss Assets/Css/Style.css" },
        devDependencies: { sass: "^1.0.0" },
      },
      null,
      2,
    ) + "\n",
  );

  console.log("");
  console.log("Boilerplate project created.");
  console.log("");
}

module.exports = createBoilerplateProject;
