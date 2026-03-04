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

## Kubernetes Deployment (Helm)

The `helm/citybuilder/` directory contains a Helm chart for deploying to Kubernetes. The chart assumes an existing CouchDB instance is available in the cluster.

### Prerequisites

- [Helm 3](https://helm.sh/)
- [kubeseal](https://github.com/bitnami-labs/sealed-secrets) — for encrypting secrets
- A Kubernetes cluster with:
  - [cert-manager](https://cert-manager.io/) configured with a `oglimmer-com-dns` ClusterIssuer
  - [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) controller installed
  - Access to `registry.oglimmer.com` (image pull secret `oglimmerregistrykey` must exist)

### 1. Create the sealed secret

CouchDB credentials are never stored in plain text in the repository. Create a local `secret.yaml` (gitignored) with the actual password, then seal it:

```bash
cd helm/citybuilder

# Edit secret.yaml with the real DB_PASSWORD
cat > secret.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: citybuilder-secret
  namespace: default
type: Opaque
stringData:
  DB_USER: citybuilder-app
  DB_PASSWORD: <actual-password>
EOF

# Encrypt it using the cluster's sealing key
kubeseal -f secret.yaml -w templates/sealed-secret.yaml
```

The generated `templates/sealed-secret.yaml` is safe to commit — only the target cluster can decrypt it. The plain `secret.yaml` is gitignored.

### 2. Build and push the Docker image

```bash
./oglimmer.sh build
```

This builds the image, pushes it to `registry.oglimmer.com/citybuilder`, and restarts the Kubernetes deployment. Run `./oglimmer.sh --help` for options (platform selection, dry-run, verbose, etc.).

### 3. Install / upgrade the Helm release

```bash
# First install
helm install citybuilder helm/citybuilder/

# Subsequent upgrades
helm upgrade citybuilder helm/citybuilder/
```

### What gets deployed

| Resource | Description |
|----------|-------------|
| Deployment | Single pod running the Node.js game server on port 1337 |
| Service | ClusterIP service exposing port 1337 |
| Ingress | TLS-terminated ingress for `cb.oglimmer.com` via cert-manager |
| ConfigMap | CouchDB host/port/schema and app server settings |
| SealedSecret | Encrypted CouchDB credentials (decrypted by the cluster) |
| ServiceAccount | Runs as non-root user (UID 10001) |

### Configuration

Key values in `helm/citybuilder/values.yaml`:

| Value | Default | Description |
|-------|---------|-------------|
| `image.repository` | `registry.oglimmer.com/citybuilder` | Docker image |
| `couchdb.host` | `couchdb-prod-couchdb.couchdb.svc.cluster.local` | CouchDB service hostname |
| `couchdb.schema` | `citybuilder` | Database name |
| `ingress.hosts[0].host` | `cb.oglimmer.com` | Public domain |
