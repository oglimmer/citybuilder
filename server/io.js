import http from 'http';
import { Server } from 'socket.io';
import { readFile } from 'fs';
import { resolve } from 'path';
import Config from './config.js';
import log4js from 'log4js';
import ioHandler from './ioHandler.js';
import GameManager from './rule_gamemanager.js';

const logger = log4js.getLogger('io');
const clientDir = resolve(import.meta.dirname, '..', 'client');

const GAME_STATE_NAMES = {
	0: 'Waiting for Players',
	1: 'City View',
	2: 'Set Bidding',
	3: 'Pick Card',
	4: 'Pick Initial Card',
};

function checkBasicAuth(req) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Basic ')) {
		return false;
	}
	const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
	const [user, password] = decoded.split(':');
	return user === Config.adminUser && password === Config.adminPassword;
}

function sendUnauthorized(res) {
	res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="CityBuilder Admin"' });
	res.end('Unauthorized');
}

function sendJson(res, statusCode, data) {
	res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}

const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CityBuilder Admin</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; background: #f5f5f5; }
  h1 { color: #333; }
  table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #4a90d9; color: #fff; }
  tr:hover { background: #f0f6ff; }
  .btn-delete { background: #d9534f; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
  .btn-delete:hover { background: #c9302c; }
  .btn-refresh { background: #5cb85c; color: #fff; border: none; padding: 8px 18px; border-radius: 4px; cursor: pointer; margin-bottom: 16px; }
  .btn-refresh:hover { background: #449d44; }
  .empty { color: #999; padding: 20px; text-align: center; }
</style>
</head>
<body>
<h1>CityBuilder Admin</h1>
<button class="btn-refresh" onclick="loadGames()">Refresh</button>
<table>
  <thead><tr><th>Game ID</th><th>Players</th><th>State</th><th># Max Players</th><th>Action</th></tr></thead>
  <tbody id="games"></tbody>
</table>
<script>
const stateNames = ${JSON.stringify(GAME_STATE_NAMES)};
async function loadGames() {
  const res = await fetch('/admin/api/games');
  const games = await res.json();
  const tbody = document.getElementById('games');
  if (games.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No games found</td></tr>';
    return;
  }
  tbody.innerHTML = games.map(g => \`<tr>
    <td>\${g.gameId.substring(0, 12)}...</td>
    <td>\${(g.playerNames || []).join(', ') || '-'}</td>
    <td>\${stateNames[g.gameState] || g.gameState}</td>
    <td>\${g.maxPlayerNumber || '-'}</td>
    <td><button class="btn-delete" onclick="deleteGame('\${g.gameId}')">Delete</button></td>
  </tr>\`).join('');
}
async function deleteGame(id) {
  if (!confirm('Delete game ' + id.substring(0, 12) + '...?')) return;
  await fetch('/admin/api/games/' + encodeURIComponent(id), { method: 'DELETE' });
  loadGames();
}
loadGames();
</script>
</body>
</html>`;

async function adminHandler(req, res) {
	const urlData = new URL(req.url, `http://${req.headers.host}`);
	const pathname = urlData.pathname;

	if (!pathname.startsWith('/admin')) {
		return false;
	}

	if (!checkBasicAuth(req)) {
		sendUnauthorized(res);
		return true;
	}

	if (pathname === '/admin' || pathname === '/admin/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(adminHtml);
		return true;
	}

	if (pathname === '/admin/api/games' && req.method === 'GET') {
		try {
			const games = await GameManager.listAllGamesAdmin();
			sendJson(res, 200, games);
		} catch (err) {
			logger.error(`[Admin] Failed to list games: ${err.message}`);
			sendJson(res, 500, { error: 'Failed to list games' });
		}
		return true;
	}

	const deleteMatch = pathname.match(/^\/admin\/api\/games\/(.+)$/);
	if (deleteMatch && req.method === 'DELETE') {
		const gameId = decodeURIComponent(deleteMatch[1]);
		try {
			await GameManager.deleteGameById(gameId);
			sendJson(res, 200, { ok: true });
		} catch (err) {
			logger.error(`[Admin] Failed to delete game ${gameId}: ${err.message}`);
			sendJson(res, 500, { error: 'Failed to delete game' });
		}
		return true;
	}

	res.writeHead(404);
	res.end('Not found');
	return true;
}

function baseHtmlHandler(req, res) {
	let lang = req.headers["accept-language"];
	logger.debug(`Lang:${lang}`);
	if ((/^de/).test(lang)) {
		lang = "de";
	} else if ((/^en/).test(lang)) {
		lang = "en";
	} else {
		lang = "en";
	}

	const urlData = new URL(req.url, `http://${req.headers.host}`);
	let pathname = urlData.pathname;
	if (pathname == "/") {
		pathname = "/index.html";
	}
	pathname = pathname.replace('..', '');

	readFile(`${clientDir}${pathname}`, (err, data) => {
		if (err) {
			res.writeHead(500);
			return res.end(`Error loading ${pathname}`);
		}
		res.setHeader("Set-Cookie", [`lang=${lang}`]);
		if ((/\.js$/).test(pathname)) {
			res.setHeader("Content-Type", "application/javascript");
		}
		if ((/\.css$/).test(pathname)) {
			res.setHeader("Content-Type", "text/css");
		}
		res.writeHead(200);
		res.end(data);
	});
}

const app = http.createServer(async (req, res) => {
	const handled = await adminHandler(req, res);
	if (!handled) {
		baseHtmlHandler(req, res);
	}
});
const io = new Server(app);
app.listen(Config.httpPort, Config.httpHost);
logger.info(`Server listen on ${Config.httpHost}:${Config.httpPort}`);

ioHandler(io, logger);

export default io;
