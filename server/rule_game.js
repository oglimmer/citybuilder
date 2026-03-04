import Player from './rule_player.js';
import CardStack from './rule_cardstack.js';
import GameField from './rule_gamefield.js';
import Field from './rule_field.js';
import CardFactory from './rule_cardfactory.js';
import MonthHelper from './rule_dateutil.js';
import { FieldType, HouseTypeMaxPop, HouseTypeReverse, GameStates } from './rule_defines.js';
import { Card } from './cards/card_basecards.js';
import log4js from 'log4js';

const logger = log4js.getLogger('game');

export default class Game {
	constructor() {
		this.clazz = "Game";
		this.playerIds = {};
		this.playerNames = [];

		this.biddings = {};
		this.auctionTakeOrder = [];
		this.cardsToAuction = [];

		this.maxPlayerNumber = 0;
		this.gameState = GameStates.WAITING_FOR_PLAYERS;

		this.currentDate = new MonthHelper();
		this.gameField = new GameField();
		this.cardsCommercial = new CardStack();
		this.cardsMisc = new CardStack();
		this.initTurn();
	}

	startGame(playTime, allPlayers) {
		this.playTime = playTime;
		this.gameState = GameStates.PICK_INITIAL_CARD;
		this.cardsCommercial.create(0, 1);
		allPlayers.forEach((player) => {
			if (this.cardsCommercial.length() < 4) {
				this.cardsCommercial.clear();
				this.cardsCommercial.create(0, 1);
			}
			const cardsToSelect = [];
			for (let i = 0; i < 4; i++) {
				cardsToSelect.push(this.cardsCommercial.removeTop());
			}
			this.cardsToAuction.push({ playerId: player._id, cardsToSelect });
		});
		this.cardsCommercial.clear();
		this.cardsCommercial.create(0, CardStack.NUMBER_PER_CARD);
		this.cardsMisc.create(1, CardStack.NUMBER_PER_CARD);
	}

	async createPlayer(socketId, playerName) {
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		const GameManager = (await import('./rule_gamemanager.js')).default;
		const newPlayer = new Player(this, socketId, playerName);
		const savedPlayer = await PlayerManager.storePlayer(newPlayer, null);
		let nextPlayerNo;
		await GameManager.storeGame(this, (gameToPrepare) => {
			nextPlayerNo = gameToPrepare.maxPlayerNumber++;
			gameToPrepare.playerIds[nextPlayerNo] = savedPlayer._id;
			gameToPrepare.playerNames.push(playerName);
			gameToPrepare.playersOnTurn.push(savedPlayer._id);
		});
		const finalPlayer = await PlayerManager.storePlayer(savedPlayer, (latestPlayer) => {
			latestPlayer.no = nextPlayerNo;
		});
		return finalPlayer;
	}

	async rejoinPlayer(socketId, player) {
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		const GameManager = (await import('./rule_gamemanager.js')).default;
		const savedPlayer = await PlayerManager.storePlayer(player, (p) => {
			p.socketId = socketId;
		});
		await GameManager.storeGame(this, () => {});
		return savedPlayer;
	}

	static async removePlayer(socketId) {
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		const GameManager = (await import('./rule_gamemanager.js')).default;
		const player = await PlayerManager.getPlayerBySocketId(socketId);
		if (!player) return null;
		const game = await GameManager.getGame(player.gameId);
		if (game.gameState == GameStates.WAITING_FOR_PLAYERS && (game.playerNames.length == 1 || game.playerNames[0] == player.playerName)) {
			logger.debug(`[removePlayer] removed last/first player during WAITING_FOR_PLAYERS...deleting game. ${game._id}`);
			const allPlayers = await PlayerManager.getPlayers(game._id);
			await GameManager.deleteGame(game);
			return { type: 'gameDeleted', allPlayers };
		} else {
			await PlayerManager.storePlayer(player, (p) => {
				p.socketId = null;
			});
			await GameManager.storeGame(game, (gameToPrepare) => {
				if (gameToPrepare.gameState == GameStates.WAITING_FOR_PLAYERS) {
					delete gameToPrepare.playerIds[player.no];
					const nameIdx = gameToPrepare.playerNames.indexOf(player.playerName);
					if (nameIdx !== -1) gameToPrepare.playerNames.splice(nameIdx, 1);
					const turnIdx = gameToPrepare.playersOnTurn.indexOf(player._id);
					if (turnIdx !== -1) gameToPrepare.playersOnTurn.splice(turnIdx, 1);
				}
			});
			return { type: 'playerRemoved', game };
		}
	}

	initTurn() {
		this.playersOnTurn = [];
		for (const k in this.playerIds) {
			this.playersOnTurn.push(this.playerIds[k]);
		}
	}

	setPlayerDone(player) {
		for (let i = 0; i < this.playersOnTurn.length; i++) {
			if (this.playersOnTurn[i] == player._id) {
				this.playersOnTurn.splice(i, 1);
				break;
			}
		}
	}

	isPlayerDone(player) {
		for (let i = 0; i < this.playersOnTurn.length; i++) {
			if (this.playersOnTurn[i] == player._id) {
				return false;
			}
		}
		return true;
	}

	async allPlayersDone() {
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		const allPlayers = await PlayerManager.getPlayers(this._id);
		logger.debug(`[allPlayersDone] allPlayers.length=${allPlayers.length}`);
		let atLeastOnePlayerInTurn = false;
		this.playersOnTurn.forEach((playerIdOnTurn) => {
			const player = allPlayers.getPlayerById(playerIdOnTurn);
			if (player.socketId !== null) {
				atLeastOnePlayerInTurn = true;
			}
		});
		logger.debug(`[allPlayersDone] atLeastOnePlayerInTurn=${atLeastOnePlayerInTurn}`);
		return !atLeastOnePlayerInTurn;
	}

	async allPlayersOffline() {
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		const allPlayers = await PlayerManager.getPlayers(this._id);
		let atLeastOnePlayerOnline = false;
		allPlayers.forEach((player) => {
			if (player.socketId !== null) {
				atLeastOnePlayerOnline = true;
			}
		});
		logger.debug(`[allPlayersOffline] atLeastOnePlayerOnline=${atLeastOnePlayerOnline}`);
		return !atLeastOnePlayerOnline;
	}

	async atLeastOneOnline(playerIds) {
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		const allPlayers = await PlayerManager.getPlayers(this._id);
		let atLeastOnePlayerOnline = false;
		allPlayers.forEach((player) => {
			if (player.socketId !== null && playerIds.includes(player._id)) {
				atLeastOnePlayerOnline = true;
			}
		});
		logger.debug(`[atLeastOneOnline] atLeastOnePlayerOnline=${atLeastOnePlayerOnline}`);
		return atLeastOnePlayerOnline;
	}

	async checkForNextTurn() {
		logger.debug(`[checkForNextTurn] gameState=${this.gameState}`);
		const allDone = await this.allPlayersDone();
		if (allDone) {
			const PlayerManager = (await import('./rule_playermanager.js')).default;
			const allPlayers = await PlayerManager.getPlayers(this._id);
			if (this.gameState == GameStates.CITY_VIEW) {
				await this.processNextTurn(allPlayers);
			} else if (this.gameState == GameStates.SET_BIDDING) {
				await this.processAuctionBid(allPlayers);
			} else if (this.gameState == GameStates.PICK_CARD) {
				if (this.auctionTakeOrder.length > 0) {
					await this.processPostAuctionSelection();
				} else {
					await this.processAuctionSelect(allPlayers);
				}
			} else if (this.gameState == GameStates.PICK_INITIAL_CARD) {
				await this.initialCardSelectionDone(allPlayers);
			}
		}
	}

	async initialCardSelectionDone(allPlayers) {
		logger.debug("[initialCardSelectionDone] start");
		this.gameState = GameStates.CITY_VIEW;
		this.initTurn();
		const GameManager = (await import('./rule_gamemanager.js')).default;
		await GameManager.storeGame(this, null);
		const { default: PlayerSocket } = await import('./socket.js');
		for (const player of allPlayers) {
			const psoc = await PlayerSocket.create(player);
			psoc.sendInitUIElements(this);
		}
	}

	async processAuctionSelect(allPlayers) {
		logger.debug("[processAuctionSelect] start");
		this.gameState = GameStates.CITY_VIEW;
		this.initTurn();
		const lastBiddings = [];
		allPlayers.forEach((player) => {
			const bid = this.biddings[player._id];
			if (typeof bid !== 'undefined') {
				lastBiddings.push({ playerName: player.playerName, bid: bid.originalBid, cost: bid.acutalCost });
			} else {
				lastBiddings.push({ playerName: player.playerName, bid: 0, cost: 0 });
			}
		});
		this.biddings = {};
		const GameManager = (await import('./rule_gamemanager.js')).default;
		await GameManager.storeGame(this, null);
		const { default: PlayerSocket } = await import('./socket.js');
		for (const player of allPlayers) {
			const psoc = await PlayerSocket.create(player);
			psoc.sentshowFieldPane({ gameState: this.gameState, lastBids: lastBiddings });
		}
	}

	async payBid(playerIds, allPlayers, part) {
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		for (const pId of playerIds) {
			const player = allPlayers.getPlayerById(pId);
			const bid = this.biddings[pId];
			const cost = bid.originalBid * part;
			bid.acutalCost = cost;
			logger.debug(`[payBid] Player ${player.playerName} bid $${bid.originalBid} by ${part}= $${cost}`);
			player.money -= cost;
			await PlayerManager.storePlayer(player, null);
		}
		allPlayers.forEach((player) => {
			if (player.money < 0) {
				const interest = player.money * 0.03;
				logger.debug(`[payBid] Player ${player.playerName} paid $${interest} interest`);
				player.money -= interest;
			}
		});
	}

	async processAuctionBid(allPlayers) {
		logger.debug("[processAuctionBid] start. this.biddings=%j", this.biddings);
		this.gameState = GameStates.PICK_CARD;
		allPlayers.forEach((player) => {
			if (player.socketId !== null && typeof this.biddings[player._id] === 'undefined') {
				this.biddings[player._id] = { originalBid: 0, acutalCost: 0 };
				logger.debug(`[processAuctionBid] added 0-bidding:${player.playerName}`);
			}
		});

		this.auctionTakeOrder = [];
		const tmpBiddings = JSON.parse(JSON.stringify(this.biddings));
		const tmpAllPlayers = allPlayers.asIdArray();
		logger.debug("[processAuctionBid] tmpAllPlayers:%j", tmpAllPlayers);
		while (Object.keys(tmpBiddings).length !== 0) {
			logger.debug(`[processAuctionBid] run:${Object.keys(tmpBiddings).length}`);
			let maxBid = -1;
			let maxBidders;
			for (const playerId in tmpBiddings) {
				const originalBid = parseInt(tmpBiddings[playerId].originalBid);
				if (maxBid < originalBid) {
					maxBid = originalBid;
					maxBidders = [playerId];
				} else if (maxBid == originalBid) {
					maxBidders.push(playerId);
				}
			}
			logger.debug("[processAuctionBid] maxBid:%d, maxBidders:%j", maxBid, maxBidders);
			maxBidders.forEach((oneMaxBidder) => {
				delete tmpBiddings[oneMaxBidder];
				const idx = tmpAllPlayers.indexOf(oneMaxBidder);
				if (idx !== -1) tmpAllPlayers.splice(idx, 1);
			});
			this.auctionTakeOrder.push(maxBidders);
		}

		await this.payBid(this.auctionTakeOrder[0], allPlayers, 1);
		for (let i = 1; i < this.auctionTakeOrder.length - 1; i++) {
			const max = this.auctionTakeOrder.length - 1;
			const part = (1 / max) * (max - i);
			await this.payBid(this.auctionTakeOrder[i], allPlayers, part);
		}

		if (tmpAllPlayers.length > 0) {
			this.auctionTakeOrder.push(tmpAllPlayers);
			logger.debug("[processAuctionBid] added final round for non-bidders: %j", tmpAllPlayers);
		}

		await this.doNextAuctionPickCard(allPlayers);
	}

	async processPostAuctionSelection() {
		logger.debug("[processPostAuctionSelection] start");
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		const allPlayers = await PlayerManager.getPlayers(this._id);
		await this.doNextAuctionPickCard(allPlayers);
	}

	async doNextAuctionPickCard(allPlayers) {
		logger.debug(`[doNextAuctionPickCard] start. auctionTakeOrder=${this.auctionTakeOrder.length}`);
		if (this.auctionTakeOrder.length == 0) {
			await this.checkForNextTurn();
		} else {
			const nextPlayerIds = this.auctionTakeOrder.shift();
			logger.debug("[doNextAuctionPickCard] nextPlayerIds=%j", nextPlayerIds);
			const atLeastOneOnline = await this.atLeastOneOnline(nextPlayerIds);
			if (!atLeastOneOnline) {
				await this.doNextAuctionPickCard(allPlayers);
			} else {
				this.playersOnTurn = JSON.parse(JSON.stringify(nextPlayerIds));
				const GameManager = (await import('./rule_gamemanager.js')).default;
				await GameManager.storeGame(this, null);
				const { default: PlayerSocket } = await import('./socket.js');
				for (const playerId of nextPlayerIds) {
					const player = allPlayers.getPlayerById(playerId);
					const psoc = await PlayerSocket.create(player);
					psoc.sendPostAuctionSelection({ gameState: this.gameState, money: player.money });
				}
			}
		}
	}

	removeCardFromAuction(cardId, playerId) {
		let c = null;
		if (this.gameState == GameStates.PICK_CARD) {
			for (let i = 0; i < this.cardsToAuction.length; i++) {
				if (this.cardsToAuction[i].id == cardId) {
					c = this.cardsToAuction[i];
					this.cardsToAuction.splice(i, 1);
				}
			}
		} else {
			for (let j = 0; j < this.cardsToAuction.length; j++) {
				if (this.cardsToAuction[j].playerId == playerId) {
					for (let i = 0; i < this.cardsToAuction[j].cardsToSelect.length; i++) {
						if (this.cardsToAuction[j].cardsToSelect[i].id == cardId) {
							c = this.cardsToAuction[j].cardsToSelect[i];
						}
					}
				}
			}
		}
		logger.debug("[removeCardFromAuction] requested:%d, got:%d", cardId, (c != null ? c.id : "-1"));
		return c;
	}

	async processNextTurn(allPlayers) {
		logger.debug("[processNextTurn] start");
		this.gameState = GameStates.SET_BIDDING;
		const changedFields = this.growCity();
		this.resetSuppliesAndCalcBuildstate(changedFields);
		this.calcLocalLevel(changedFields);
		this.doSocialChanges();
		this.calcSupplies();
		const incomeReceipt = this.calcIncome(allPlayers);
		this.currentDate.nextMonth();
		this.playTime--;
		this.initTurn();
		if (this.playTime == 0) {
			await this.processEndGame(allPlayers);
		} else {
			const cardsToAuction = [];
			for (let i = 0; i < allPlayers.length; i++) {
				cardsToAuction.push(this.cardsCommercial.removeTop());
			}
			cardsToAuction.push(this.cardsMisc.removeTop());
			await this.sendAuction(allPlayers, changedFields, cardsToAuction, incomeReceipt);
		}
	}

	growCity() {
		const houseType = Math.floor((Math.random() * 3)) * 3 + 3;
		return this.gameField.add(3, 3, houseType, HouseTypeMaxPop[HouseTypeReverse[houseType]], houseType == 3 ? 30 : houseType == 6 ? 0 : -10);
	}

	async sendAuction(allPlayers, changedFields, cardsToAuction, incomeReceipt) {
		this.cardsToAuction = cardsToAuction;
		for (const player of allPlayers) {
			await this.sendAuctionToPlayer(player, changedFields, incomeReceipt);
		}
		const GameManager = (await import('./rule_gamemanager.js')).default;
		await GameManager.storeGame(this, null);
	}

	async sendAuctionToPlayer(player, changedFields, incomeReceipt) {
		player.availableActions |= 1;
		const newTurnData = this.constructNewTurnData(player, changedFields, incomeReceipt);
		const PlayerManager = (await import('./rule_playermanager.js')).default;
		const { default: PlayerSocket } = await import('./socket.js');
		const savedPlayer = await PlayerManager.storePlayer(player, null);
		const psoc = await PlayerSocket.create(savedPlayer);
		psoc.startAuction(newTurnData);
	}

	resetSuppliesAndCalcBuildstate(changedFields) {
		for (const k in this.gameField.fields) {
			const field = this.gameField.fields[k];
			if (field.buildState == 1) {
				field.buildState++;
				changedFields[`${field.x}:${field.y}`] = field;
			}
			if (field.type === FieldType.HOUSE) {
				field.attachedCard.supply = [];
				field.localLevel = field.baseLocalLevel;
			} else {
				Card.reinitSync(field.attachedCard);
			}
		}
	}

	calcSupplies() {
		for (const k in this.gameField.fields) {
			const field = this.gameField.fields[k];
			if (field.type !== FieldType.HOUSE) {
				field.attachedCard.calcSupplies(field, this.gameField.fields);
			}
		}
	}

	calcLocalLevel(changedFields) {
		for (const k in this.gameField.fields) {
			const field = this.gameField.fields[k];
			if (field.type !== FieldType.HOUSE) {
				field.attachedCard.calcLocalLevel(field, this.gameField.fields, changedFields);
			}
		}
	}

	doSocialChanges() {
		for (const k in this.gameField.fields) {
			const field = this.gameField.fields[k];
			if (field.type === FieldType.HOUSE) {
				Field.socialChange(field);
			}
		}
	}

	calcIncome(allPlayers) {
		const incomeReceipt = [];
		for (const k in this.gameField.fields) {
			const field = this.gameField.fields[k];
			if (field.type !== FieldType.HOUSE) {
				const player = allPlayers.getPlayerByNo(field.owner);
				const fieldIncome = field.attachedCard.calcRent(field, this.gameField.fields);
				player.money += fieldIncome;
				incomeReceipt.push([player.playerName, fieldIncome, field.attachedCard.title, field.x, field.y]);
			}
		}
		return incomeReceipt;
	}

	async processEndGame(allPlayers) {
		const winner = { player: null, maxMoney: -1, scoreList: [] };
		allPlayers.forEach((player) => {
			if (player.money > winner.maxMoney) {
				winner.playerName = player.playerName;
				winner.maxMoney = player.money;
			}
			winner.scoreList.push({ playerName: player.playerName, money: player.money });
		});
		const { default: PlayerSocket } = await import('./socket.js');
		for (const player of allPlayers) {
			const psoc = await PlayerSocket.create(player);
			psoc.sendEndGame({ winner });
		}
		const GameManager = (await import('./rule_gamemanager.js')).default;
		await GameManager.deleteGame(this);
	}

	constructMsgInfoBar(player) {
		return {
			gameState: this.gameState,
			money: player.money,
			playerNumber: this.playerNames.length,
			currentDate: `${this.currentDate.toString()} (${this.playTime})`
		};
	}

	constructNewTurnData(player, changedFields, incomeReceipt) {
		return {
			gameState: this.gameState,
			infoBar: this.constructMsgInfoBar(player),
			uiElement: changedFields,
			availableActions: player.availableActions,
			cardsToAuction: this.cardsToAuction,
			incomeReceipt
		};
	}

	setBidding(player, bid) {
		logger.debug(`[setBidding] Accepted bid for player ${player.playerName} : -${bid}-`);
		this.biddings[player._id] = { acutalCost: 0, originalBid: bid };
	}

	static async reinit(body) {
		Object.setPrototypeOf(body, Game.prototype);
		await CardStack.reinit(body.cardsCommercial);
		await CardStack.reinit(body.cardsMisc);
		GameField.reinit(body.gameField);
		MonthHelper.reinit(body.currentDate);
	}
}
