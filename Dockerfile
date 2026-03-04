# Stage 1: Build client assets with Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY server/ server/
COPY db/ db/
COPY startServer.js log4js_config.json ./

# Copy Vite build output as the client directory
COPY --from=build /app/dist/ client/

# Copy static assets not processed by Vite
COPY client/images/ client/images/
COPY client/preview-portal.html client/

EXPOSE 1337
CMD ["node", "startServer.js"]
