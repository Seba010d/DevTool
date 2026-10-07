# DevTool

DevTool is a command-line tool for managing and opening local development projects from one simple interface.

Instead of manually navigating through folders, DevTool lets you browse your projects and quickly open them in your preferred development tools.

## Features

- 📁 Browse project folders
- 🚀 Open projects quickly
- 💻 Open projects in VS Code
- 🖥️ Open a terminal directly inside a project
- 📂 Open projects in Finder
- ⚙️ Configure your projects location
- 📋 View available projects without showing full paths
- 🧭 Navigate through folders using an interactive menu
- 🛠️ Built for developers working with multiple local projects

## Requirements

- Node.js
- npm
- macOS

## Installation

Clone the repository:

```bash
git clone https://github.com/Seba010d/DevTool.git
```

Enter the project:

```bash
cd DevTool
```

Install the dependencies:

```bash
npm install
```

## Usage

Start DevTool with:

```bash
npm start
```

DevTool will open an interactive menu where you can manage and open your projects.

## Project Location

DevTool uses a configured projects directory as the main location for your development projects.

For example:

```text
~/Github/
├── Portfolio/
├── TChat/
├── DevTool/
├── FGU-Opgaver/
└── FrontendMentor/
```

You can configure the projects location from DevTool's settings.

## Opening a Project

When selecting a project, DevTool provides options for working with it.

### VS Code

Opens the selected project directly in Visual Studio Code.

### Terminal

Opens a new terminal window in the selected project directory.

### Finder

Opens the selected project folder in Finder.

## Commands

| Command       | Description                  |
| ------------- | ---------------------------- |
| `npm start`   | Start DevTool                |
| `npm install` | Install project dependencies |

## Technologies

DevTool is built using:

- **Node.js**
- **JavaScript**
- **Inquirer**
- **File System API**
- **Path API**
- **macOS Terminal / Finder / VS Code integration**

## Project Structure

```text
DevTool/
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

Additional files may be added as DevTool grows.

## Goals

The goal of DevTool is to make managing development projects faster and easier.

Instead of repeatedly using commands such as:

```bash
cd ~/Github/SomeProject
code .
```

DevTool provides an interactive way to find and open the project.

## Future Improvements

Possible future features include:

- 🔍 Project search
- ⭐ Favorite projects
- 🕘 Recently opened projects
- 🧰 Project templates
- 📦 Create new projects from templates
- 🔧 More configuration options
- 🐙 Optional Git/GitHub tools
- 🎨 More customization options

## Status

DevTool is currently under active development.

The project is primarily being built as a learning project while exploring Node.js, CLI applications, file-system operations, and developer tooling.

## Author

**Sebastian Christiansen**

GitHub: [Seba010d](https://github.com/Seba010d)

---

Made with JavaScript and Node.js.
