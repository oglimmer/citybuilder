import PlayerManager from './rule_playermanager.js';

export default class PlayerSocket {
	#socket;
	#player;

	constructor(socket, player) {
		this.#socket = socket;
		this.#player = player;
	}

	static async create(player) {
		const socket = await player.getSocket();
		return new PlayerSocket(socket, player);
	}

	emit(name, msg) {
		this.#socket.emit(name, msg);
	}

	sendInitUIElements(game) {
		this.#socket.emit('uiElement', game.gameField.forPlayer(this.#player));
		this.#socket.emit('showFieldPane', { gameState: game.gameState });
	}

	async sendToAllPlayersInGame(getData) {
		const allPlayers = await PlayerManager.getPlayers(this.#player.gameId);
		for (const aPlayer of allPlayers) {
			const data = getData(aPlayer);
			(await aPlayer.getSocket()).emit(data.msg, data.payLoad);
		}
	}

	startAuction(newTurnData) {
		this.#socket.emit('startAuction_resp', newTurnData);
	}

	sendEndGame(winner) {
		this.#socket.emit('gamedEnded', winner);
	}

	sendPostAuctionSelection(msg) {
		this.#socket.emit('postAuctionSelection', msg);
	}

	sentshowFieldPane(msg) {
		this.#socket.emit('showFieldPane', msg);
	}
}
