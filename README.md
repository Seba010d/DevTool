# DevTool

**A terminal-based project launcher and project creator for macOS.**

DevTool gives you one interactive place to browse your local development folders, open projects in your tools, and create new projects from ready-to-use templates.

## Features

- **Browse projects** — navigate folders and select projects from an interactive terminal menu.
- **Search projects** — press `/` in the project browser to search project names.
- **Open projects** — open a selected project in Visual Studio Code, Terminal, or Finder.
- **Create projects** — generate a project from one of the included templates.
- **Configure locations** — choose your main projects directory and the location used when creating projects.
- **Manage settings** — clear recent-project data or reset DevTool's settings.
- **Terminal UI** — use keyboard navigation without having to remember long folder paths.

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

The main menu includes **Projects**, **Create project**, **Settings**, and **Quit**.

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

Available templates:

| Template | What it creates |
| --- | --- |
| Empty project | A clean starting folder |
| Node.js project | A basic Node.js project |
| Node.js + Express | A Node.js project using Express |
| Web | A basic web project |
| Web + SCSS | A web project with SCSS setup |
| JavaScript App | A JavaScript application starter |
| Boilerplate | A general-purpose starter structure |

DevTool creates a `.devtool.json` file in generated projects to store project metadata.

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
