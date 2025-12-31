# Local Development Setup (Cloning + Running the Project)

## Prerequisites

Ensure the following are installed:
Git
Node.js + npm
(Windows users may need to install Git Bash or run npm through npm.cmd in PowerShell.)

## 1. Clone the Repository

Open a terminal, navigate to a directory where you want the project stored, then run:
git clone https://github.com/ryan-birm/377_project.git

Move into the project folder containing the Vite React application:
cd 377_project/my-project

## 2. Install Dependencies
Because PowerShell may block npm scripts, use:

npm.cmd install
(If using Git Bash or VS Code terminal configured for Git Bash, normal npm install works.)

## 3. Start the Development Server

Run the Vite dev server:
npm.cmd run dev

Terminal output will show a local development URL similar to:
http://localhost:5173/

Open this URL in your browser to view the application.

The first time you set up the project, dependency installation may take several minutes.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
