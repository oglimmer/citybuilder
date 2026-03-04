import http from 'http';
import { Server } from 'socket.io';
import { readFile } from 'fs';
import { resolve } from 'path';
import Config from './config.js';
import log4js from 'log4js';
import ioHandler from './ioHandler.js';

const logger = log4js.getLogger('io');
const clientDir = resolve(import.meta.dirname, '..', 'client');

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

const app = http.createServer(baseHtmlHandler);
const io = new Server(app);
app.listen(Config.httpPort, Config.httpHost);
logger.info(`Server listen on ${Config.httpHost}:${Config.httpPort}`);

ioHandler(io, logger);

export default io;
