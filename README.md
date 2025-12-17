# Chroma Browser

A modern web-based management interface for ChromaDB vector database, built with Next.js 16+ App Router and featuring a professional purple-themed UI design.

## Features

- **Collection Management**: Create, list, and delete ChromaDB collections with a modern UI
- **Record Operations**: Add, query, get, update, and delete records within collections
- **Server Status Monitoring**: Check server heartbeat and version, with database reset capability
- **Runtime Configuration**: Configure Chroma host and port through the settings interface (no environment variables required)
- **Modern UI Design**: Professional purple-themed interface with gradients, smooth animations, and consistent styling
- **Responsive Design**: Fully responsive layout that works on all screen sizes
- **Type Safety**: Full TypeScript support for both client and server code
- **Security**: All ChromaDB interactions happen server-side to prevent direct client access
- **Dark Mode Support**: Automatic dark/light mode based on system preferences

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- A running ChromaDB instance

## Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The application will be available at http://localhost:3000

## Project Structure

```
app/
├── api/                 # Server-side API routes
│   ├── collections/     # Collection management endpoints
│   ├── records/         # Record management endpoints
│   └── server/          # Server status endpoints
├── collections/         # Collections list page
├── collection/[id]/     # Collection detail page
├── server/              # Server status page
├── components/          # Shared React components
└── utils/              # Utility functions and services
```

## API Endpoints

### Collection Management
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create a new collection
- `DELETE /api/collections` - Delete a collection

### Record Management
- `GET /api/records/count` - Get record count in a collection
- `POST /api/records/add` - Add records to a collection
- `POST /api/records/get` - Get records from a collection
- `POST /api/records/query` - Query records in a collection
- `POST /api/records/delete` - Delete records from a collection
- `POST /api/records/update` - Update records in a collection
- `POST /api/records/upsert` - Upsert records in a collection

### Server Management
- `GET /api/server/status` - Check server status
- `POST /api/server/reset` - Reset the entire database

## Security

All interactions with ChromaDB happen server-side through API routes. Client components never directly connect to ChromaDB, ensuring better security and separation of concerns.

## Error Handling

Comprehensive error handling with user-friendly messages for common issues:
- Connection errors to ChromaDB
- Invalid input validation
- Operation-specific error messages

## UI Components

- **Loading Indicators**: Violet-themed spinners with smooth animations
- **Confirmation Dialogs**: Modern modal dialogs with backdrop blur for destructive operations
- **Form Validation**: Real-time input validation with violet focus rings and helpful error messages
- **Dark Mode Support**: Automatic dark/light mode based on system preferences
- **Settings Modal**: Configure Chroma host and port at runtime
- **Drawer Component**: Right-sliding drawer for collection creation
- **Gradient Buttons**: Modern gradient buttons with purple/violet themes
- **Responsive Cards**: Cards with rounded corners and subtle shadows
- **Notification System**: Semantic color-coded notifications with emoji icons

## Development

This project uses:
- Next.js 16+ with App Router
- TypeScript for type safety
- Tailwind CSS 4 for modern styling
- React Server Components where appropriate
- ESLint for code quality
- ChromaDB JavaScript Client for database interactions

### Key Dependencies

- `chromadb`: ^3.1.8 - ChromaDB JavaScript client
- `next`: 16.0.10 - Next.js framework
- `react`: 19.2.1 - React library
- `tailwindcss`: ^4 - CSS framework

To build for production:
```bash
pnpm build
```

To start the production server:
```bash
pnpm start
```

## UI Modernization

The application features a comprehensive modern UI redesign with a professional purple theme:

### Color Palette
- **Primary**: Violet (#7c3aed) with gradient effects
- **Neutral**: Slate colors for better contrast and depth
- **Success/Error/Warning**: Semantic colors with improved visibility

### Design Features
- Gradient buttons with smooth hover effects
- Backdrop blur for modals and dialogs
- Smooth animations and transitions
- Responsive design with mobile support
- Improved typography and spacing
- Violet-themed focus states for accessibility

### Key UI Components
- Modern cards with rounded corners and subtle shadows
- Right-sliding drawer for collection creation
- Settings modal for runtime configuration
- Confirmation dialogs for destructive operations
- Violet-themed loading spinners
