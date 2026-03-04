# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CityBuilder is a card-based multiplayer online board game built with Node.js, Socket.IO v4, and CouchDB/PouchDB. Players manage virtual cities by bidding on and playing cards representing buildings.

## Commands

### Running Locally
```bash
./run_local.sh           # Start PouchDB (Docker) + Node server
./run_local.sh -f        # Start and tail logs
```
Access at http://localhost:1337 (local) or http://localhost:8080 (Docker).

### Manual Setup
```bash
npm install
node startServer.js      # Requires CouchDB running on localhost:5984
```

### Development (Client)
```bash
npm run dev              # Start Vite dev server (proxies /socket.io to localhost:1337)
npm run build            # Production build to dist/
```

### Testing
```bash
npm test                 # Run all tests (Vitest)
npx vitest run tests/<testfile>.js  # Run a single test file
```

## Architecture

The codebase uses ES modules (`"type": "module"` in package.json) and ES6 classes throughout.

### Server (`server/`)
- **`ioHandler.js`** — Main Socket.IO event handler; routes all client requests and orchestrates game flow
- **`io.js`** — HTTP server and Socket.IO v4 `Server` setup
- **`rule_game.js`** — Core game logic and state management (largest file, ES6 class)
- **`rule_gamemanager.js`** — Game CRUD with CouchDB persistence (async/await)
- **`rule_player.js`** / **`rule_playermanager.js`** — Player logic and persistence. `PlayerCollection extends Array` with helper methods
- **`rule_gamefield.js`** — Game board representation
- **`rule_cardstack.js`** — Card collection management
- **`rule_cardfactory.js`** — Card instantiation using class reference map
- **`rule_card.js`** — Barrel file re-exporting all card classes
- **`cards/`** — Card type definitions (`card_*.js`), ES6 classes extending `Card`/`RentalCard`
- **`config.js`** — Configuration loading (env var `CITYBUILDER_PROPERTIES` > file > defaults)
- **`socket.js`** — `PlayerSocket` class wrapping Socket.IO socket

### Client (`client/`)
ES modules with Vite bundler. HTML5 Canvas rendering. No jQuery.

- **`game/main.js`** — ESM entry point, initializes game on DOMContentLoaded
- **`game/state.js`** — Shared state module (`socket`, `G`, `GL`, constants)
- **`game/Global.js`** — Main game state class, creates all UI components
- **`game/ServerCommListener.js`** — Socket.IO event listeners (client-server protocol)
- **`game/CanvasManager.js`** — Canvas rendering engine (`CanvasManager`, `CanvasManagerUIMode`)
- **`game/FieldPane.js`** — Game board display
- **`game/Card.js`** — Card classes (`BaseCard`, `Card`, `AuctionCard`)
- **`game/CardLayouter.js`** — Card hand positioning
- **`game/AuctionPanel.js`** — Bidding interface
- **`game/GlobalListeners.js`** — Canvas mouse/resize event handlers
- **`game/PreGameHtml.js`** — Pre-game UI functions (create/join/start game)
- **`game/I18n.js`** — Internationalization (English/German)
- **`game/Cookie.js`** — Cookie utilities
- **`game/UIServices.js`** — UI utility static methods
- **`game/UIElement.js`** — Board field class
- **`game/Button.js`** — Canvas button class
- **`game/InfoField.js`** / **`game/InfoBar.js`** — Info panel displays

### Communication Protocol
Client-server uses Socket.IO with a `*_req` / `*_resp` naming convention for request-response pairs.

### Game States
`WAITING_FOR_PLAYERS` (0) → `CITY_VIEW` (1) → `SET_BIDDING` (2) → `PICK_CARD` (3) / `PICK_INITIAL_CARD` (4)

### Database
CouchDB with two document types (`clazz` field): `Game` and `Player`. Views defined in `db/_design-game-view.json`. Uses document versioning (`_rev`) for conflict handling.

### Configuration
Priority: env var `CITYBUILDER_PROPERTIES` → `localrun/.../citybuilder.properties` → `server/citybuilder_default.properties`. Key properties: `dbHost`, `db`, `dbSchema`, `httpPort`, `httpHost`.

## Keyboard Shortcuts (In-Game Canvas)

Implemented in `client/game/GlobalListeners.js`. Only active when the game canvas is visible and focus is not in an input field.

| Key | Action |
|-----|--------|
| `Enter` or `e` | End Round / Submit Bid / Pick Card (clicks the turn-done button) |
| `1`-`9` | Field view: toggle hand card by index. Auction view: select auction card by index |
| `p` | Play the currently expanded card |
| `d` | Discard the currently expanded card |
| `f` | Auto-place card on first valid board cell (during target selection) |
| `c` | Cancel card placement |
| `v` or `Tab` | Toggle between auction and field (board) view |
| `i` | Toggle player info overlay (balances, income, bids) |
| `m` | Cycle UI mode (house types, population, influence maps) |
| `Escape` | Close info overlay, collapse expanded card, or close info field |
| Arrow keys | Pan the board |

### Browser MCP Interaction Flow

To play the game via browser MCP:
1. Navigate to `http://localhost:5173/`
2. Type player name into the input, click "Create Game" or "List available Games"
3. On waiting screen: click "Start now!" (need 1+ player, can solo-start)
4. Initial card selection: press `1`-`4` to select a card, then `e` to confirm
5. Field view: press `1`-`N` to expand a hand card, `p` to play, click a board cell to place
6. Press `e` to end round
7. Bidding phase: type bid amount in the bid input field, press `e` to submit
8. Card pick phase: press `1`-`4` to select auction card, `e` to confirm

## Code Patterns
- All server and client code uses ES6 classes and ESM imports/exports
- Server uses async/await throughout
- Card reinit uses `Object.setPrototypeOf` for deserializing from CouchDB
- Circular dependencies resolved with dynamic `import()` (Player→io, Card→CardFactory)
- Server validates all actions via action bits to prevent cheating
- Player reconnection supported via Socket.IO connection tracking and CouchDB persistence
