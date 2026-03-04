import Config from './config.js';
import Nano from 'nano';
import Player from './rule_player.js';
import log4js from 'log4js';

const db = Nano(Config.db);
const logger = log4js.getLogger('game');

export class PlayerCollection extends Array {
	getPlayerByNo(playerNo) {
		return this.find(p => p.no == playerNo);
	}

	getPlayerById(playerId) {
		return this.find(p => p._id == playerId);
	}

	asIdArray() {
		return this.map(p => p._id);
	}
}

const PlayerManager = {

	async getPlayer(playerId) {
		if (typeof playerId === "undefined") {
			logger.error("Error in getPlayer - playerId is undefined");
			return;
		}
		const body = await db.get(playerId, { revs_info: false });
		await Player.reinit(body);
		return body;
	},

	async getOtherPlayers(player) {
		const allPlayers = await this.getPlayers(player.gameId);
		return allPlayers.filter(p => p.no !== player.no);
	},

	async getPlayers(gameId) {
		if (typeof gameId === "undefined") {
			logger.error("Error in getPlayers - gameId is undefined");
			return;
		}
		const body = await db.view("game", "playersByGameId", { key: gameId });
		const players = new PlayerCollection();
		for (const doc of body.rows) {
			const loadedPlayer = doc.value;
			await Player.reinit(loadedPlayer);
			players.push(loadedPlayer);
		}
		return players;
	},

	async getPlayerBySocketId(socketId) {
		if (typeof socketId === "undefined") {
			logger.error("Error in getPlayerBySocketId - socketId is undefined");
			return;
		}
		const body = await db.view('game', 'playersBySocketId', { key: socketId });
		if (body.rows.length > 0) {
			return body.rows[0].value;
		}
	},

	async storePlayer(player, prepare) {
		if (prepare != null) {
			prepare(player);
		}
		const body = await db.insert(player);
		player._id = body.id;
		player._rev = body.rev;
		return player;
	}
};

export default PlayerManager;
