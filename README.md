# CityBuilder

A card-based multiplayer online board game built with Node.js, Socket.IO, and CouchDB.

## Development Setup

### Prerequisites

- Node.js (v22+)
- Docker & Docker Compose (for CouchDB)

### Start the database

```bash
docker compose up -d couchdb couchdb-setup
```

This starts CouchDB on `localhost:5984` and initializes the `citybuilder` database with the required design documents.

### Start the game server

```bash
npm install
node startServer.js
```

The game server runs on `http://localhost:1337`. It re-creates the database schema on every start, serves the client files, and handles all Socket.IO communication.

### Start the Vite dev server (optional)

```bash
npm run dev
```

Vite provides hot module replacement for client-side development. It proxies `/socket.io` requests to the game server on port 1337, so **both the game server and Vite must be running**. Access the game at the URL Vite prints (usually `http://localhost:5173`).

### Run tests

```bash
npm test
```

## Production (Docker)

Build and run everything with Docker Compose:

```bash
docker compose up -d
```

This starts three services:

- **couchdb** — CouchDB 3 database with persistent storage
- **couchdb-setup** — One-shot init container that creates the database and design documents
- **app** — The game server, built via a multi-stage Dockerfile (Vite builds the client assets, then only production dependencies and the built output are included in the final image)

The game is available at `http://localhost:1337`.

### How the production build works

The `Dockerfile` uses a two-stage build:

1. **Build stage** — Installs all dependencies, runs `npm run build` (Vite) to bundle and optimize the client-side code into `dist/`.
2. **Production stage** — Installs only production dependencies, copies the server code and the built client assets. Static files like `images/` and `preview-portal.html` are copied separately since Vite doesn't process them.

The game server serves files from its `client/` directory. In the Docker image, the Vite build output is placed there, so no server code changes are needed.

The database connection is configured via a Docker Compose `configs` block that injects a properties file pointing to the `couchdb` service hostname instead of `localhost`.
