import Config from './config.js';
import Nano from 'nano';
import Game from './rule_game.js';
import log4js from 'log4js';

const db = Nano(Config.db);
const logger = log4js.getLogger('game');

const GameManager = {

	async createGame() {
		const newGame = new Game();
		return await this.storeGame(newGame, null);
	},

	async deleteGame(game) {
		const { default: PlayerManager } = await import('./rule_playermanager.js');
		const allPlayers = await PlayerManager.getPlayers(game._id);
		for (const player of allPlayers) {
			await db.destroy(player._id, player._rev);
		}
		await db.destroy(game._id, game._rev);
	},

	async getGame(gameId) {
		if (typeof gameId === "undefined") {
			logger.error("Error in getGame - gameId is undefined");
			return;
		}
		try {
			const body = await db.get(gameId, { revs_info: false });
			await Game.reinit(body);
			return body;
		} catch (err) {
			logger.error(`[GameManager] - getGame failed for id ${gameId}: ${err.message}`);
		}
	},

	async listAllGames() {
		const body = await db.view("game", "allGames");
		return body.rows.map(doc => ({ gameId: doc.id, players: doc.value }));
	},

	async storeGame(game, prepare) {
		while (true) {
			try {
				let doInsert = true;
				if (prepare != null) {
					const prepareReturn = prepare(game);
					if (typeof prepareReturn !== 'undefined') {
						doInsert = prepareReturn;
					}
				}
				if (!doInsert) {
					logger.warn("[storeGame] stopped due to doInsert==false");
					return null;
				}
				const body = await db.insert(game);
				game._id = body.id;
				game._rev = body.rev;
				return game;
			} catch (err) {
				logger.error(`[storeGame] failed. ${prepare == null ? 'HARD FAIL!' : 'will try again...'} : ${err.message}`);
				if (prepare == null) {
					throw err;
				}
				game = await this.getGame(game._id);
			}
		}
	}
};

export default GameManager;
