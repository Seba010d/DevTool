const fs = require("fs");
const path = require("path");

function createBoilerplateProject(projectPath) {
  const assetsPath = path.join(projectPath, "Assets");
  const cssPath = path.join(assetsPath, "Css");
  const imagesPath = path.join(assetsPath, "Images");
  const jsPath = path.join(assetsPath, "JS");
  const modulesPath = path.join(jsPath, "modules");
  const scssPath = path.join(projectPath, "scss");

  fs.mkdirSync(cssPath, { recursive: true });
  fs.mkdirSync(imagesPath, { recursive: true });
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

  <body></body>
</html>
`;

  const cssContent = "";

  const jsContent = `// Add your application code here.
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

  const scssContent = `// @use "reset";
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

  console.log("");
  console.log("Boilerplate project created.");
  console.log("");
}

module.exports = createBoilerplateProject;
