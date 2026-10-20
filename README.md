# DevTool

**A terminal-based project launcher and project creator for macOS.**

DevTool gives you one interactive place to browse your local development folders, open projects in your tools, and create new projects from ready-to-use templates.

## Features

- **Browse projects** — navigate folders and select projects from an interactive terminal menu.
- **Search projects** — press `/` in the project browser to search project names.
- **Recent projects** — see a subtle marker beside projects you have opened recently.
- **Open projects** — open a selected project in Visual Studio Code, Ghostty, or Finder.
- **Create projects** — generate a project from one of the included templates.
- **Import projects** — register an existing folder, with a warning if a matching project is already registered.
- **Manage projects** — view project information, rename, move, run, install dependencies, or delete a project.
- **Configure locations** — choose your main projects directory and the location used when creating projects.
- **Manage settings** — clear recent-project data or reset DevTool's settings.
- **Responsive terminal UI** — menus adapt to terminal width and height, with colored templates, key hints, and consistent success and error messages.

## Requirements

- macOS
- [Node.js](https://nodejs.org/) and npm
- [Visual Studio Code](https://code.visualstudio.com/) for the VS Code open action

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Seba010d/DevTool.git
cd DevTool
npm install
```

## Usage

Start the interactive launcher:

```bash
npm start
```

The main menu includes **Projects**, **Create project**, **Import existing project**, **Settings**, and **Quit**.

You can also use the command-line interface directly:

```bash
node index.js --help
node index.js create
```

- `node index.js` or `npm start` opens the main menu.
- `node index.js create` starts the project creation flow.
- `node index.js --help` displays the available commands.

## Create a project

Choose **Create project** from the main menu, or run `node index.js create`. DevTool asks for a project name and location, then lets you select a template.

In the location picker, choose **Create a new folder here** to add a subfolder. The picker distinguishes folders from registered projects and marks folder actions with symbols.

Available templates:

| Template | What it creates |
| --- | --- |
| Empty project | Project metadata only |
| Node.js project | `index.js`, `package.json` |
| Node.js + TypeScript | `src/index.ts`, `tsconfig.json`, `package.json` |
| Node.js + Express | `server.js`, `package.json` |
| Web | `index.html`, `index.js`, `Assets/Css/style.css` |
| Web + SCSS | Web files, `scss/style.scss`, Sass build/watch scripts |
| JavaScript App | HTML and separate CSS/JS asset files |
| Boilerplate | HTML, compiled CSS, SCSS, reset styles, and JS utility module |

DevTool creates a `.devtool.json` file in generated projects to store project metadata.

Choose **Import existing project** from the main menu to register a folder in the projects browser. DevTool infers a basic project type from its files and `package.json` and stores that information in `.devtool.json`.

## Project locations and settings

By default, DevTool looks for a `Github` folder in your home directory. If it doesn't exist, it uses your home directory.

Open **Settings** to:

- Change the main projects directory.
- Choose the last-used project creation location.
- Clear recent-project data.
- Reset DevTool's settings.

Settings are saved to:

```text
~/.config/devtool/config.json
```

## Project structure

```text
DevTool/
├── config/       # Default configuration
├── templates/    # Project template generators
├── utils/        # Browsing, menus, settings, and UI helpers
├── index.js      # CLI entry point
├── package.json
└── README.md
```

## Technologies

- JavaScript
- Node.js (CommonJS)
- [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts)
- Node.js file-system and path APIs

## Project status

DevTool is an evolving personal developer-tooling project. Features and workflows may change as development continues.

## Author

**Sebastian A. Christiansen**  
[GitHub: Seba010d](https://github.com/Seba010d)

---

Made with JavaScript and Node.js.
