#!/usr/bin/env node

import { readFileSync } from 'fs';
import log4js from 'log4js';
import Config from './server/config.js';
import Nano from 'nano';

log4js.configure('./log4js_config.json');

const nano = Nano(Config.dbHost);

(async () => {
	try {
		await nano.db.destroy(Config.dbSchema);
	} catch (err) {
		// just ignore
	}
	try {
		await nano.db.create(Config.dbSchema);
		await nano.use(Config.dbSchema).insert(JSON.parse(readFileSync('./db/_design-game-view.json', 'utf8')));
	} catch (err) {
		// just ignore
	}

	await import('./server/io.js');
})();
