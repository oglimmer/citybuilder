import CardStack from './rule_cardstack.js';
import log4js from 'log4js';

const logger = log4js.getLogger('game');

export default class Player {
	constructor(game, socketId, playerName) {
		this.clazz = "Player";
		this.gameId = game._id;
		this.socketId = socketId;
		this.playerName = playerName;
		this.money = 0;
		this.availableActions = 1;
		this.cardHand = new CardStack();
	}

	async getSocket() {
		const { default: io } = await import('./io.js');
		if (this.socketId !== null) {
			return io.sockets.sockets.get(this.socketId);
		}
		return { emit() {} };
	}

	async playCard(cardIdToPlay, targetFieldId) {
		if ((this.availableActions & 1) === 0) {
			logger.debug(`[playCard] availableActions=${this.availableActions}, return from playCard`);
			return;
		}
		const { default: PlayerManager } = await import('./rule_playermanager.js');
		const { default: GameManager } = await import('./rule_gamemanager.js');
		const game = await GameManager.getGame(this.gameId);
		let field = null;
		let cardPlayReturn;
		await GameManager.storeGame(game, (gameToPrepare) => {
			const card = this.cardHand.getById(cardIdToPlay);
			field = gameToPrepare.gameField.fields[targetFieldId];
			cardPlayReturn = card.play(field, this, gameToPrepare.gameField.fields);
		});
		const savedPlayer = await PlayerManager.storePlayer(this, (playerToPrepare) => {
			const card = playerToPrepare.cardHand.getById(cardIdToPlay);
			playerToPrepare.availableActions ^= card.actionBit;
			playerToPrepare.cardHand.removeCardById(cardIdToPlay);
		});
		return { player: savedPlayer, field, cardPlayReturn };
	}

	static async reinit(body) {
		Object.setPrototypeOf(body, Player.prototype);
		await CardStack.reinit(body.cardHand);
	}
}
