# yt2dl

> YouTube Downloader using NodeJS

A TypeScript-based YouTube downloader powered by [youtubei.js](https://github.com/LuanRT/YouTube.js).

## Features

- 🚀 Modern TypeScript codebase with Express.js web framework
- 📦 Built with YouTubeI.js for reliable YouTube data extraction
- 🎬 Fetch video metadata (title, description, thumbnails, duration, views, etc.)
- 📹 Support for multiple video qualities and formats (144p to 4K)
- 🎵 Audio-only download options with various bitrates
- 🔧 Complete development tooling (ESLint, Prettier, TypeScript)
- 🔄 PM2 process management for production
- 🎯 Type-safe code with strict TypeScript configuration
- 🌐 RESTful API endpoints for integration
- 📱 Static file serving for frontend interfaces

## What's New in v2.0.0

This version represents a complete rewrite with significant improvements:

- **Express.js Integration**: Built a complete Express.js server with proper middleware, routing, and error handling
- **API Endpoints**: Two main endpoints for video information retrieval and download
- **Modular Architecture**: Organized codebase into logical modules (core, handlers, routers, utilities, events)
- **Enhanced Video Processing**: Parse and format streaming data with codec labels, file sizes, and media categories
- **Token-based Downloads**: Secure download mechanism using base64-encoded tokens
- **Better Error Handling**: Comprehensive error handling with HTTP status codes
- **Static Frontend**: Included multiple frontend versions (v1.0.0, v1.0.1, v1.0.2) in the public directory
- **Production Ready**: PM2 configurations for both development and production environments

## API Endpoints

### GET `/api/video-info`

Fetches YouTube video metadata and available download formats.

**Query Parameters:**

- `url` (required): YouTube video URL or video ID

**Response:**

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "videoId": "string",
    "title": "string",
    "description": "string",
    "thumbnails": [...],
    "duration": "number (seconds)",
    "viewCount": "number",
    "author": "string",
    "uploadDate": "string",
    "formats": [
      {
        "label": "1080p (H264 + AAC) - 125.5 MB",
        "type": "video",
        "size": "125.5 MB",
        "mime": "mp4",
        "code": "avc1.640028, mp4a.40.2",
        "token": "base64_encoded_token"
      }
    ]
  }
}
```

### POST `/api/download`

Downloads the selected video/audio format.

**Request Body:**

```json
{
  "url": "YouTube video URL or ID",
  "token": "Format token from video-info response"
}
```

**Response:**

- Stream: Direct video/audio file download
- Headers: `Content-Disposition` with filename, `Content-Type` with MIME type

## Architecture

### Project Structure

```
src/
├── index.ts              # Application entry point
├── core/                 # Core functionality
│   ├── app.ts           # Express app configuration
│   ├── yt_core.ts       # YouTubeI.js client initialization
│   ├── get_video_info.ts # Video metadata extraction
│   └── parse_streaming_data.ts # Format parsing logic
├── handler/             # Request handlers
│   ├── video_info.ts   # Video info endpoint handler
│   └── download.ts     # Download endpoint handler
├── router/              # Route definitions
│   └── api.ts          # API routes
├── event/               # Server event handlers
│   ├── listener.ts     # Server listener setup
│   ├── on_listening.ts # Listening event handler
│   └── on_error.ts     # Error event handler
└── util/                # Utility functions
    ├── base_64.ts       # Base64 encoding/decoding
    ├── codec_label.ts   # Codec label formatting
    ├── format_audio_bitrate.ts # Audio bitrate formatting
    ├── format_size.ts   # File size formatting
    ├── media_category.ts # Media type categorization
    └── normalize_port.ts # Port normalization
```

### Key Components

- **YouTubeI.js Integration**: Custom initialization with platform shimming for proper video URL extraction
- **Streaming Data Parser**: Parses YouTube's adaptive and combined formats into user-friendly options
- **Token System**: Encodes format metadata (itag, mime type) into secure tokens for download requests
- **Error Handling**: Comprehensive HTTP error handling with proper status codes and messages
- **Type Safety**: Full TypeScript coverage with strict type checking

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

## Usage Example

### Using the API

```bash
# Get video information
curl "http://localhost:3000/api/video-info?url=https://www.youtube.com/watch?v=VIDEO_ID"

# Download a format (use token from video-info response)
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO_ID","token":"BASE64_TOKEN"}' \
  --output video.mp4
```

### Using the Web Interface

The project includes three frontend versions in the `public/` directory:

- `v1-0-0/`: Initial version
- `v1-0-1/`: Enhanced version with assets
- `v1-0-2/`: Latest version with responsive design

Access them at:

- Root: `http://localhost:3000/`
- Version specific: `http://localhost:3000/v1-0-2/`

## Configuration

### TypeScript

The project uses strict TypeScript configuration with:

- Target: ES2022
- Module: Node16 (ESM)
- Strict mode enabled
- Source maps and declarations generated
- Unused parameters and variables detection

### ESLint

Modern flat config format with:

- TypeScript ESLint integration
- Prettier integration
- Recommended rules enabled
- Custom rules for unused variables (with `_` prefix exception)

### Prettier

Configured with:

- Single quotes
- Semicolons
- 80 character line width
- 2 space indentation
- LF line endings

### PM2

Two configurations provided:

- **Production** (`ecosystem.config.js`): Runs compiled JavaScript from `dist/`, 500MB memory limit
- **Development** (`ecosystem.dev.config.cjs`): Runs TypeScript directly with tsx watch mode, auto-restart on changes

## Environment Variables

```bash
# Optional: Server port (default: 3000)
PORT=3000

# Optional: Node environment
NODE_ENV=development # or production
```

## Scripts Reference

| Command             | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `yarn dev`          | Run in development mode with hot reload (tsx)              |
| `yarn dev:pm2`      | Run development server with PM2 (auto-restart)             |
| `yarn build`        | Compile TypeScript (includes pre-build checks)             |
| `yarn start`        | Run compiled code                                          |
| `yarn start:pm2`    | Run with PM2 process manager                               |
| `yarn stop:pm2`     | Stop all PM2 processes                                     |
| `yarn restart:pm2`  | Restart all PM2 processes                                  |
| `yarn logs:pm2`     | View PM2 logs                                              |
| `yarn monit:pm2`    | Monitor PM2 processes                                      |
| `yarn clean`        | Remove dist folder                                         |
| `yarn format`       | Format code with Prettier                                  |
| `yarn format:check` | Check code formatting                                      |
| `yarn lint`         | Lint code with ESLint                                      |
| `yarn lint:fix`     | Lint and auto-fix issues                                   |
| `yarn type-check`   | Run TypeScript type checking                               |
| `yarn validate`     | Run all validations (lint + format + typecheck)            |
| `yarn prebuild`     | Auto-runs before build (clean + lint + format + typecheck) |

### Husky Git Hooks

Git hooks are managed with Husky to ensure code quality:

- **prepare**: Automatically installed on `yarn install`
- **pre-commit**: Runs validation before commits
- **pre-push**: Validates code quality before pushing (runs lint, format check, type check, and build)

## Technical Details

### Dependencies

**Production:**

- `express` (^5.1.0): Web framework for Node.js
- `http-errors` (^2.0.0): HTTP error handling
- `youtubei.js` (^16.0.1): YouTube data extraction library

**Development:**

- TypeScript tooling: `typescript`, `tsx`, `@types/*`
- Code quality: `eslint`, `prettier`, `husky`
- Process management: `pm2`

### Format Categories

The application categorizes media into three types:

- **Video**: Combined video and audio streams
- **Video Only**: Video-only streams (no audio)
- **Audio**: Audio-only streams

Each format includes:

- Quality label (e.g., "1080p", "720p", "128kbps")
- Codec information (e.g., "H264 + AAC", "VP9")
- File size estimation
- MIME type and extension
- Secure download token

### Security Features

- Input validation for YouTube URLs and video IDs
- Base64-encoded tokens for download authorization
- Error handling to prevent information leakage
- MIME type validation before streaming

## Troubleshooting

**Issue**: "Cannot find module" errors

- **Solution**: Run `yarn install` and ensure all dependencies are installed

**Issue**: Port already in use

- **Solution**: Change the PORT environment variable or stop the process using port 3000

**Issue**: YouTube video not found

- **Solution**: Ensure the video URL is correct and the video is publicly accessible

**Issue**: Download fails

- **Solution**: The token may have expired or be invalid. Request a new video-info to get fresh tokens

## License

GPL-3.0 (General Public License v3.0)

## Author

ipincamp <support@nur-arifin.my.id>

## Repository

https://github.com/ipincamp/yt2dl

## Contributing

Contributions are welcome! Please ensure your code:

- Passes all linting checks (`yarn lint`)
- Is properly formatted (`yarn format`)
- Passes type checking (`yarn type-check`)
- Includes appropriate tests if applicable

The pre-push hook will automatically validate your changes before pushing.
