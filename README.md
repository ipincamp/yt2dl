# yt2dl

> YouTube Downloader using NodeJS

A TypeScript-based YouTube downloader powered by [youtubei.js](https://github.com/LuanRT/YouTube.js).

## Features

- 🚀 Modern TypeScript codebase
- 📦 Built with YouTubeI.js
- 🔧 Complete development tooling (ESLint, Prettier, TypeScript)
- 🔄 PM2 process management for production
- 🎯 Type-safe code with strict TypeScript configuration

## Requirements

- Node.js >= 22.x
- npm >= 10.x or Yarn >= 1.22.x

## Installation

```bash
# Clone the repository
git clone https://github.com/ipincamp/yt2dl.git
cd yt2dl

# Install dependencies
yarn install
```

## Development

### Run in Development Mode

```bash
# Run with hot reload (tsx watch)
yarn dev

# Run with PM2 (watch mode)
yarn dev:pm2
```

### Code Quality

```bash
# Format code with Prettier
yarn format

# Check formatting
yarn format:check

# Lint code
yarn lint

# Lint and auto-fix issues
yarn lint:fix

# Type check
yarn type-check

# Run all validations (lint, format check, type check)
yarn validate
```

## Git Hooks

The project uses [Husky](https://typicode.github.io/husky/) to enforce code quality:

- **pre-push**: Runs linting, format checking, type checking, and build before pushing to ensure code quality

All code pushed to the repository is automatically validated and built.

## Production

### Build

```bash
# Build the project (runs prebuild checks: clean, lint, format:check, type-check)
yarn build
```

### Run

```bash
# Run compiled code
yarn start

# Run with PM2 process manager
yarn start:pm2
```

### PM2 Management

```bash
# Stop all PM2 processes
yarn stop:pm2

# Restart all PM2 processes
yarn restart:pm2

# View PM2 logs
yarn logs:pm2

# Monitor PM2 processes
yarn monit:pm2
```

## Project Structure

```
yt2dl/
├── src/
│   └── index.ts           # Main application entry point
├── dist/                  # Compiled JavaScript output (generated)
├── logs/                  # PM2 logs (generated)
├── eslint.config.mjs      # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore patterns
├── tsconfig.json          # TypeScript configuration
├── ecosystem.config.js    # PM2 production configuration
├── ecosystem.dev.config.js # PM2 development configuration
└── package.json           # Project dependencies and scripts
```

## Configuration

### TypeScript

The project uses strict TypeScript configuration with:

- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Source maps and declarations generated

### ESLint

Modern flat config format with:

- TypeScript ESLint integration
- Prettier integration
- Recommended rules enabled

### Prettier

Configured with:

- Single quotes
- Semicolons
- 80 character line width
- 2 space indentation
- LF line endings

### PM2

Two configurations provided:

- **Production** (`ecosystem.config.js`): Runs compiled JavaScript from `dist/`
- **Development** (`ecosystem.dev.config.js`): Runs TypeScript directly with tsx watch mode

## Scripts Reference

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `yarn dev`          | Run in development mode with hot reload         |
| `yarn dev:pm2`      | Run development server with PM2                 |
| `yarn build`        | Compile TypeScript (includes pre-build checks)  |
| `yarn start`        | Run compiled code                               |
| `yarn start:pm2`    | Run with PM2 process manager                    |
| `yarn stop:pm2`     | Stop all PM2 processes                          |
| `yarn restart:pm2`  | Restart all PM2 processes                       |
| `yarn logs:pm2`     | View PM2 logs                                   |
| `yarn monit:pm2`    | Monitor PM2 processes                           |
| `yarn clean`        | Remove dist folder                              |
| `yarn format`       | Format code with Prettier                       |
| `yarn format:check` | Check code formatting                           |
| `yarn lint`         | Lint code with ESLint                           |
| `yarn lint:fix`     | Lint and auto-fix issues                        |
| `yarn type-check`   | Run TypeScript type checking                    |
| `yarn validate`     | Run all validations (lint + format + typecheck) |

### Husky

Git hooks are managed with Husky:

- **prepare**: Automatically installed on `yarn install`
- **pre-push**: Validates code quality before pushing (runs lint, format check, type check, and build)

## License

GPL-3.0

## Author

ipincamp <support@nur-arifin.my.id>

## Repository

https://github.com/ipincamp/yt2dl
