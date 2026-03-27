# WebOS

Open-source web operating system and productivity office suite. A browser-native OS with a full suite of built-in applications.

## Features

- **Desktop Environment** - Window manager, taskbar, start menu, desktop icons
- **Writer** - Word processor with formatting, tables, images (TipTap)
- **Calc** - Spreadsheet with formulas, formatting, charts (HyperFormula)
- **Notes** - Notion-like block editor with slash commands
- **Draw** - Figma-like drawing canvas (Fabric.js)
- **Impress** - Presentation editor with slide management
- **File Manager** - Grid/list views, drag-and-drop, file preview
- **PDF Viewer** - Page navigation, zoom, search (PDF.js)
- **Terminal** - Command-line interface with VFS integration
- **Text Editor** - Code editor with syntax highlighting (CodeMirror)
- **Calculator** - Standard calculator with safe expression parser
- **Settings** - Theme switching, wallpaper, display options

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 (CSS variable theming)
- Zustand (state management)
- Dexie.js (IndexedDB storage)
- Cloudflare Pages (deployment)

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run test      # Run tests
npm run test:coverage  # Tests with coverage
```

## Deploy

```bash
npm run deploy    # Build and deploy to Cloudflare Pages
```

## License

MIT
