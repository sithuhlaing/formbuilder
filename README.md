# Form Builder

An interactive drag-and-drop form builder with multi-page support, built with React, TypeScript, and Vite.

## Features

- 🎯 Drag-and-drop interface for building forms
- 📄 Multi-page form support
- 🎨 13 different field types (text, number, select, etc.)
- 👁️ Live preview mode
- 💾 Template saving and loading
- 📱 Responsive design
- 🔄 Unified modal system

## Development

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions.

### Automatic Deployment

Every push to the `main` branch triggers:
1. Code linting
2. Test execution  
3. Production build
4. Deployment to GitHub Pages

### Manual Deployment

You can also deploy manually:

```bash
npm run deploy
```

## GitHub Pages Setup

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "GitHub Actions"
4. The site will be available at: `https://[username].github.io/formbuilder/`

## Project Structure

```
src/
├── components/          # React components
│   ├── atoms/          # Basic UI components
│   ├── molecules/      # Composite components
│   └── Modal.tsx       # Unified modal system
├── hooks/              # Custom React hooks
├── services/           # Business logic and services
├── styles/             # CSS files
└── types/              # TypeScript type definitions
```

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React DnD** - Drag and drop functionality
- **CSS Variables** - Consistent theming
- **Vitest** - Testing framework
- **GitHub Actions** - CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
