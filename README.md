# Content Planner

A simple desktop app for organizing and saving social media posts locally.

## Features

- Create, edit, and delete social media posts
- Upload and store media files (2-20 files per post)
- Support for images (jpg, jpeg, png, webp) and videos (mp4, mov)
- Organize posts by username, caption, platforms, and scheduled time
- Multi-platform support (Instagram, Threads, TikTok)
- Local-first storage with SQLite
- No authentication or cloud sync required

## Tech Stack

- **Tauri** - Desktop app framework
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **SQLite** - Local database
- **Rust** - Backend logic

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- Rust (latest stable)

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the App

Development mode:
```bash
npm run tauri:dev
```

Build for production:
```bash
npm run tauri:build
```

## Project Structure

```
content-planner/
├── src/                  # React frontend
│   ├── components/       # UI components
│   ├── App.tsx          # Main app component
│   ├── api.ts           # Tauri API calls
│   ├── types.ts         # TypeScript types
│   └── styles.css       # Global styles
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Entry point
│   │   ├── commands.rs  # Tauri commands
│   │   ├── db.rs        # Database setup
│   │   └── models.rs    # Data models
│   └── Cargo.toml       # Rust dependencies
└── package.json         # Node dependencies
```

## Usage

1. **Create a Post**: Click "Create New Post" and fill in the form
2. **Upload Media**: Drag and drop files or use the file picker (2-20 files)
3. **Select Platforms**: Choose one or more platforms (Instagram, Threads, TikTok)
4. **Schedule**: Set the date and time for the post
5. **Save**: Click "Save Post" to persist the data
6. **Edit/Delete**: Use the buttons on each post card to modify or remove posts

## Data Storage

- Database: Stored in the app data directory
- Media files: Stored in `{app_data}/media/`
- All data is local and never leaves your device

## License

This project is for personal use.
