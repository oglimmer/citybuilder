import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import log4js from 'log4js';
import Config from '../server/config.js';
import Nano from 'nano';

const logger = log4js.getLogger('io');

describe.skip('ioHandler (requires CouchDB)', () => {

	beforeEach(async () => {
		const nano = Nano(Config.dbHost);
		try {
			await nano.db.destroy(Config.dbSchema);
		} catch (err) {
			// just ignore
		}
		await nano.db.create(Config.dbSchema);
		await nano.use(Config.dbSchema).insert(JSON.parse(readFileSync('./db/_design-game-view.json', 'utf8')));
	});

	it('createGame', async () => {
		const { default: ioHandler } = await import('../server/ioHandler.js');

		const emitted = {};
		const io = {
			sockets: {
				on(name, eventHandler) {
					this[name] = eventHandler;
				},
				emit(name, payLoad) {
					emitted[name] = payLoad;
				}
			}
		};

		ioHandler(io, logger);
		await io.sockets.connection(io.sockets);
		await io.sockets.createGame_req({ playerName: "oli" });

		expect(emitted.waitAddPlayer_resp.playerName).toEqual(["oli"]);
		expect(emitted.waitAddPlayer_resp.showStartButton).toBe(true);
	});
});
