# Chroma Browser

A web-based management interface for ChromaDB vector database, built with Next.js 14+ App Router.

## Features

- **Collection Management**: Create, list, and delete ChromaDB collections
- **Record Operations**: Add, query, get, update, and delete records within collections
- **Server Status Monitoring**: Check server heartbeat and version, with database reset capability
- **Responsive UI**: Clean, responsive interface built with Tailwind CSS
- **Type Safety**: Full TypeScript support for both client and server code
- **Security**: All ChromaDB interactions happen server-side to prevent direct client access

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- A running ChromaDB instance (configured to run on port 3003)

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

- **Loading Indicators**: Visual feedback during async operations
- **Confirmation Dialogs**: Safety checks for destructive operations
- **Form Validation**: Real-time input validation with helpful error messages
- **Dark Mode Support**: Automatic dark/light mode based on system preferences

## Development

This project uses:
- Next.js 14+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React Server Components where appropriate
- ESLint for code quality

To build for production:
```bash
pnpm build
```

To start the production server:
```bash
pnpm start
```
