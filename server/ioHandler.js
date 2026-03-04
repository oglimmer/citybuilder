import { GameStates } from './rule_defines.js';
import Field from './rule_field.js';
import GameField from './rule_gamefield.js';
import GameManager from './rule_gamemanager.js';
import PlayerManager from './rule_playermanager.js';
import Game from './rule_game.js';
import PlayerSocket from './socket.js';

export default function (io, logger) {

	io.on('connection', (socket) => {
		/* A client creates a new game, joins it and waits for other players */
		socket.on('createGame_req', async (data) => {
			logger.debug("[createGame_req] player:%s", data.playerName);
			const game = await GameManager.createGame();
			await game.createPlayer(socket.id, data.playerName);
			socket.emit('waitAddPlayer_resp', { playerName: [data.playerName], showStartButton: true, clear: true });
		});
		/* A client joins a game and waits for other players. */
		socket.on('joinGame_req', async (data) => {
			logger.debug("[joinGame_req] player:%s, game:%s", data.playerName, data.gameId);
			const game = await GameManager.getGame(data.gameId);
			const player = await game.createPlayer(socket.id, data.playerName);
			socket.emit('waitAddPlayer_resp', { playerName: game.playerNames, clear: true });
			const otherPlayers = await PlayerManager.getOtherPlayers(player);
			for (const otherPlayer of otherPlayers) {
				(await otherPlayer.getSocket()).emit('waitAddPlayer_resp', { playerName: [data.playerName] });
			}
		});
		/* A client wants to check if his old game is still running. */
		socket.on('reJoinGameCheck_req', async (data) => {
			await GameManager.getGame(data.gameId);
			socket.emit('reJoinGameCheck_resp');
		});
		/* A client wants to re-join an old game. */
		socket.on('reJoinGame_req', async (data) => {
			const game = await GameManager.getGame(data.gameId);
			const player = await PlayerManager.getPlayer(data.playerId);
			const savedPlayer = await game.rejoinPlayer(socket.id, player);
			if (data.reconnect !== true) {
				const psoc = await PlayerSocket.create(savedPlayer);
				psoc.emit('sendPlayerData', { gameId: game._id, playerId: savedPlayer._id, playerNo: savedPlayer.no, availableActions: savedPlayer.availableActions });
				psoc.emit('uiElement', game.gameField.forPlayer(savedPlayer));
				psoc.emit('card', savedPlayer.cardHand);
				await psoc.sendToAllPlayersInGame((pla) => {
					return { msg: 'infoBar', payLoad: game.constructMsgInfoBar(pla) };
				});
				if (game.gameState == GameStates.CITY_VIEW) {
					psoc.emit('showFieldPane', { gameState: game.gameState });
				} else if (game.gameState == GameStates.SET_BIDDING) {
					const newTurnData = game.constructNewTurnData(savedPlayer, {}, []);
					psoc.emit('startAuction_resp', newTurnData);
				} else if (game.gameState == GameStates.PICK_CARD) {
					const newTurnData = game.constructNewTurnData(savedPlayer, {}, []);
					psoc.emit('startAuction_resp', newTurnData);
					psoc.emit('postAuctionSelection', { gameState: game.gameState, money: savedPlayer.money });
				}
				if (game.isPlayerDone(savedPlayer)) {
					psoc.emit('showWait');
				}
			}
		});
		/* requests all "waiting for other players" games */
		socket.on('listGames_req', async () => {
			const list = await GameManager.listAllGames();
			socket.emit('listGames_resp', list);
		});
		/* the host started the game */
		socket.on('startGame', async (data) => {
			logger.debug("[startGame] playTime:%d", data.playTime);
			const player = await PlayerManager.getPlayerBySocketId(socket.id);
			const game = await GameManager.getGame(player.gameId);
			const allPlayers = await PlayerManager.getPlayers(game._id);
			await GameManager.storeGame(game, (gameToPrepare) => {
				gameToPrepare.startGame(data.playTime, allPlayers);
			});
			const savedGame = await GameManager.getGame(game._id);
			const refreshedPlayers = await PlayerManager.getPlayers(savedGame._id);
			for (const aPlayer of refreshedPlayers) {
				const psoc = await PlayerSocket.create(aPlayer);
				const cardsToSelect = savedGame.cardsToAuction.find(c => c.playerId === aPlayer._id).cardsToSelect;
				psoc.emit('sendPlayerData', { gameId: savedGame._id, playerId: aPlayer._id, playerNo: aPlayer.no, availableActions: aPlayer.availableActions });
				psoc.emit('initialCardSelection', { cardsToSelect, infoBar: savedGame.constructMsgInfoBar(aPlayer) });
			}
		});
		/* a player clicked "play" on a card which requires a field target. */
		socket.on('prePlayCard_req', async (data) => {
			logger.debug("[prePlayCard_req] playerId:%s, card: %j", data.playerId, data.card);
			const player = await PlayerManager.getPlayer(data.playerId);
			const card = player.cardHand.getById(data.card.id);
			const eventData = card.prePlay(player);
			socket.emit('prePlayCard_resp', eventData);
		});
		/* a player clicked "play" on a card which doesn't require a field target. This card will take affect immediately */
		socket.on('directCardPlay_req', async (data) => {
			logger.debug("[directCardPlay_req] playerId:%s, card:%j", data.playerId, data.card);
			const player = await PlayerManager.getPlayer(data.playerId);
			const card = player.cardHand.getById(data.card.id);
			await card.playDirect(player, async (newFieldList) => {
				socket.emit('cardPlaySelectTarget_resp', { cardId: data.card.id });
				const allPlayers = await PlayerManager.getPlayers(player.gameId);
				for (const pla of allPlayers) {
					(await pla.getSocket()).emit('uiElement', newFieldList);
				}
			});
		});
		/* a player clicked "discard" on a card. */
		socket.on('cardDiscard_req', async (data) => {
			logger.debug("[cardDiscard_req] player:%s, card:%j", data.playerId, data.card);
			const player = await PlayerManager.getPlayer(data.playerId);
			await PlayerManager.storePlayer(player, (playerToPrepare) => {
				playerToPrepare.cardHand.removeCardById(data.card.id);
			});
		});
		/* a player clicked on a field. This selects the target for a previously "played" card */
		socket.on('cardPlaySelectTarget_req', async (data) => {
			logger.debug("[cardPlaySelectTarget_req] playerId:%s, cardIdToPlay:%s, field:%s", data.playerId, data.cardIdToPlay, data.targetFieldId);
			const player = await PlayerManager.getPlayer(data.playerId);
			try {
				const result = await player.playCard(data.cardIdToPlay, data.targetFieldId);
				if (!result) return;
				const { player: savedPlayer, field, cardPlayReturn } = result;
				const fieldsToSend = cardPlayReturn.changedFields;
				(await savedPlayer.getSocket()).emit('cardPlaySelectTarget_resp', { field: fieldsToSend, cardId: data.cardIdToPlay, availableActions: savedPlayer.availableActions });
				if (cardPlayReturn.secretPlay !== true) {
					const otherPlayers = await PlayerManager.getOtherPlayers(savedPlayer);
					for (const otherPlayer of otherPlayers) {
						(await otherPlayer.getSocket()).emit('cardPlaySelectTarget_resp', { field: GameField.forPlayer(otherPlayer, fieldsToSend) });
					}
				}
			} catch (error) {
				(await player.getSocket()).emit('cardPlaySelectTargetFailed_resp', { cardId: data.cardIdToPlay, error });
			}
		});
		/* A player clicked the button "round end". So we have to be in gameState==1. */
		socket.on('roundEnd_req', async (data) => {
			logger.debug("[roundEnd_req] playerId:%s", data.playerId);
			const player = await PlayerManager.getPlayer(data.playerId);
			const game = await GameManager.getGame(player.gameId);
			await GameManager.storeGame(game, (gameToPrepare) => {
				gameToPrepare.setPlayerDone(player);
			});
			await game.checkForNextTurn();
		});
		/* A player clicked the button "Set bidding". So we have to be in gameState==2. */
		socket.on('auctionBid_req', async (data) => {
			logger.debug("[auctionBid_req] playerId:%s", data.playerId);
			const player = await PlayerManager.getPlayer(data.playerId);
			if (!isNaN(data.bid) && data.bid >= 0) {
				const game = await GameManager.getGame(player.gameId);
				await GameManager.storeGame(game, (gameToPrepare) => {
					gameToPrepare.setBidding(player, data.bid);
					gameToPrepare.setPlayerDone(player);
				});
				await game.checkForNextTurn();
			} else {
				logger.warn(`Player ${data.playerId} send bid:${data.bid}`);
			}
		});
		/* A player clicked the button "Pick card". So we have to be in gameState==3. */
		socket.on('postAuctionSelect_req', async (data) => {
			logger.debug("[postAuctionSelect_req] playerId:%s, card:%s", data.playerId, data.cardId);
			const player = await PlayerManager.getPlayer(data.playerId);
			const game = await GameManager.getGame(player.gameId);
			let selectedCard = null;
			const savedGame = await GameManager.storeGame(game, (gameToPrepare) => {
				if (data.cardId !== null) {
					selectedCard = gameToPrepare.removeCardFromAuction(data.cardId, player._id);
				}
				logger.debug(`[postAuctionSelect_req] Player ${player.playerName} wanted to select card ${data.cardId} and got ${selectedCard !== null ? selectedCard.id : "null"}`);
				if (selectedCard !== null || data.cardId === null) {
					gameToPrepare.setPlayerDone(player);
				} else {
					socket.emit('postAuctionSelection', { gameState: gameToPrepare.gameState });
					return false;
				}
			});
			if (savedGame === null) return;
			if (data.cardId !== null) {
				if (savedGame.gameState == GameStates.PICK_CARD) {
					const otherPlayers = await PlayerManager.getOtherPlayers(player);
					for (const otherPlayer of otherPlayers) {
						const psoc = await PlayerSocket.create(otherPlayer);
						psoc.emit('auctionCardRemove', { card: selectedCard });
					}
				}
				await PlayerManager.storePlayer(player, (playerToPrepare) => {
					playerToPrepare.cardHand.addTop(selectedCard);
				});
				socket.emit('card', { cards: [selectedCard] });
				await savedGame.checkForNextTurn();
			} else {
				await savedGame.checkForNextTurn();
			}
		});
		/* A player clicked on the infobar and wants to see the other players balance */
		socket.on('requestAllPlayerData_req', async (data) => {
			logger.debug("[requestAllPlayerData_req] playerId:%s", data.playerId);
			const player = await PlayerManager.getPlayer(data.playerId);
			const allPlayers = await PlayerManager.getPlayers(player.gameId);
			const retList = allPlayers.map(p => ({
				name: p.playerName,
				money: p.money,
				conn: (p.socketId !== null)
			}));
			socket.emit('requestAllPlayerData_resp', retList);
		});
		/* A player disconnected ;) */
		socket.on('disconnect', async () => {
			logger.debug("[disconnect] playerId:%s", socket.id);
			const result = await Game.removePlayer(socket.id);
			if (!result) return;
			if (result.type === 'gameDeleted') {
				for (const player of result.allPlayers) {
					const playerSocket = await player.getSocket();
					if (playerSocket) {
						playerSocket.emit('gameCanceled');
					}
				}
			} else {
				const game = result.game;
				if (game.gameState == GameStates.WAITING_FOR_PLAYERS) {
					const msg = { playerName: game.playerNames, clear: true };
					const allPlayers = await PlayerManager.getPlayers(game._id);
					for (const aPlayer of allPlayers) {
						(await aPlayer.getSocket()).emit('waitAddPlayer_resp', msg);
					}
				} else {
					logger.debug("[disconnect] game.playerNames=%j", game.playerNames);
					const allOffline = await game.allPlayersOffline();
					if (!allOffline) {
						await game.checkForNextTurn();
						const allPlayers = await PlayerManager.getPlayers(game._id);
						for (const player of allPlayers) {
							if (player.socketId !== null) {
								const psoc = await PlayerSocket.create(player);
								psoc.emit('infoBar', game.constructMsgInfoBar(player));
							}
						}
					}
				}
			}
		});
	});
}
