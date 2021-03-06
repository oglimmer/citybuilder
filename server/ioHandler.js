var GameStates = require("./rule_defines.js").GameStates;
var Field = require('./rule_field.js');
var GameField = require('./rule_gamefield.js');
var util = require('util');

// we want to have all sort of communication in this class
// we want to have workflow / controller logic here
// we don't want to have any real game logic (chaging state on games/players/cards/fileds) here

module.exports = function(io, logger) {

	io.sockets.on('connection', function (socket) {
		/* A client creates a new game, joins it and waits for other players */
		socket.on('createGame_req', function (data) {
			logger.debug("[createGame_req] player:%s", data.playerName);
			var GameManager = require("./rule_gamemanager.js");
			GameManager.createGame(function(game) {			
				game.createPlayer(socket.id, data.playerName, function(player) {
					socket.emit('waitAddPlayer_resp', { playerName: [ data.playerName ], showStartButton: true, clear: true}); 
				});
			});
		});		
		/* A client joins a game and waits for other players. */
		socket.on('joinGame_req', function (data) {
			logger.debug("[joinGame_req] player:%s, game:%s",data.playerName,data.gameId);
			var GameManager = require("./rule_gamemanager.js");
			var PlayerManager = require("./rule_playermanager.js");
			GameManager.getGame(data.gameId, function(game) {
				game.createPlayer(socket.id, data.playerName, function(player) {
					socket.emit('waitAddPlayer_resp', { playerName: game.playerNames, clear: true } );
					PlayerManager.getOtherPlayers(player, function(otherPlayer) {
						otherPlayer.getSocket().emit('waitAddPlayer_resp', { playerName: [ data.playerName ] });
					});
				});
			});
		});
		/* A client wants to check if his old game is still running. */
		socket.on('reJoinGameCheck_req', function (data) {
			var GameManager = require("./rule_gamemanager.js");
			GameManager.getGame(data.gameId, function(game) {
				socket.emit('reJoinGameCheck_resp');
			});
		});
		/* A client wants to re-join an old game. */
		socket.on('reJoinGame_req', function (data) {
			var GameManager = require("./rule_gamemanager.js");
			var PlayerManager = require("./rule_playermanager.js");
			GameManager.getGame(data.gameId, function(game) {
				PlayerManager.getPlayer(data.playerId, function(player) {
					game.rejoinPlayer(socket.id, player, function(savedPlayer) {
						if(data.reconnect !== true) {
							var psoc = require('./socket.js')(savedPlayer);
							psoc.emit('sendPlayerData', {gameId:game._id, playerId: savedPlayer._id, playerNo: savedPlayer.no, availableActions: savedPlayer.availableActions }); // sendPlayerData
							psoc.emit('uiElement', game.gameField.forPlayer(savedPlayer));						
							psoc.emit('card', savedPlayer.cardHand); // sends all cards
							psoc.sendToAllPlayersInGame(function(pla) {
								return { msg: 'infoBar', payLoad: game.constructMsgInfoBar(pla) }; // update the player# for all others
							})
							if(game.gameState==GameStates.CITY_VIEW) {
								psoc.emit('showFieldPane', { gameState : game.gameState });
							} else if(game.gameState==GameStates.SET_BIDDING) {
								var newTurnData = game.constructNewTurnData(savedPlayer, {}, []);	
								psoc.emit('startAuction_resp', newTurnData);
							} else if(game.gameState==GameStates.PICK_CARD) {
								var newTurnData = game.constructNewTurnData(savedPlayer, {}, []);	
								psoc.emit('startAuction_resp', newTurnData);
								psoc.emit('postAuctionSelection', {gameState: game.gameState, money: savedPlayer.money});
							}
							if(game.isPlayerDone(savedPlayer)) {
								psoc.emit('showWait');
							}
						}
					});
				});
			});
		});				
		/* requests all "waiting for other players" games */
		socket.on('listGames_req', function (data) {
			var GameManager = require("./rule_gamemanager.js");
			GameManager.listAllGames(function(list) {
				socket.emit('listGames_resp', list); 
			});
		});
		/* the host started the game */
		socket.on('startGame', function(data) {
			logger.debug("[startGame] playTime:%d", data.playTime);
			var GameManager = require("./rule_gamemanager.js");
			var PlayerManager = require("./rule_playermanager.js");
			PlayerManager.getPlayerBySocketId(socket.id, function(player) {
				GameManager.getGame(player.gameId, function(game) {					
					PlayerManager.getPlayers(game._id, null, function(allPlayers) {		
						GameManager.storeGame(game, function(gameToPrepare) {
							gameToPrepare.startGame(data.playTime, allPlayers);
						}, function(savedGame) {
							PlayerManager.getPlayers(savedGame._id, function(aPlayer) {
								var psoc = require('./socket.js')(aPlayer);
								var cardsToSelect = savedGame.cardsToAuction.findByProp("playerId", aPlayer._id).cardsToSelect;
								psoc.emit('sendPlayerData', {gameId:savedGame._id, playerId: aPlayer._id, playerNo: aPlayer.no, availableActions: aPlayer.availableActions });
								psoc.emit('initialCardSelection', {cardsToSelect : cardsToSelect, infoBar: savedGame.constructMsgInfoBar(aPlayer) });
							});
						});
					});
				});
			});
		});
		/* a player clicked "play" on a card which requires a field target. */
		socket.on('prePlayCard_req', function (data) {
			logger.debug("[prePlayCard_req] playerId:%s, card: %j", data.playerId, data.card);
			/*data={playerId,card}*/
			var PlayerManager = require("./rule_playermanager.js");
			PlayerManager.getPlayer(data.playerId, function(player) {			
				var card = player.cardHand.getById(data.card.id);
				var eventData = card.prePlay(player);
				socket.emit('prePlayCard_resp', eventData);
			});
		});
		/* a player clicked "play" on a card which doesn't require a field target. This card will take affect immediately */
		socket.on('directCardPlay_req', function(data) {
			logger.debug("[directCardPlay_req] playerId:%s, card:%j",data.playerId,data.card);
			/*data={playerId,card}*/
			var PlayerManager = require("./rule_playermanager.js");
			PlayerManager.getPlayer(data.playerId, function(player) {
				var card = player.cardHand.getById(data.card.id);
				card.playDirect(player, function(newFieldList) {
					socket.emit('cardPlaySelectTarget_resp', {cardId : data.card.id});
					PlayerManager.getPlayers(player.gameId, function(pla) {
						pla.getSocket().emit('uiElement', newFieldList);
					});
				});
			});	
		});
		/* a player clicked "discard" on a card. */
		socket.on('cardDiscard_req', function (data) {
			logger.debug("[cardDiscard_req] player:%s, card:%j",data.playerId,data.card);
			/*data={playerId,card}*/
			var PlayerManager = require("./rule_playermanager.js");
			PlayerManager.getPlayer(data.playerId, function(player) {
				PlayerManager.storePlayer(player, function(playerToPrepare) {
					playerToPrepare.cardHand.removeCardById(data.card.id);
				});	
			});
		});
		/* a player clicked on a field. This selects the target for a previously "played" card */
		socket.on('cardPlaySelectTarget_req', function(data) {
			logger.debug("[cardPlaySelectTarget_req] playerId:%s, cardIdToPlay:%s, field:%s",data.playerId,data.cardIdToPlay,data.targetFieldId);
			/*data={playerId,cardIdToPlay,targetFieldId}*/
			var PlayerManager = require("./rule_playermanager.js");
			// load player
			PlayerManager.getPlayer(data.playerId, function(player) {
				player.playCard(data.cardIdToPlay, data.targetFieldId, 
					/*onSuccess*/function(player, field, cardPlayReturn) {
						var fieldsToSend = cardPlayReturn.changedFields;
						player.getSocket().emit('cardPlaySelectTarget_resp', {field: fieldsToSend, cardId: data.cardIdToPlay, availableActions: player.availableActions});
						if(cardPlayReturn.secretPlay !== true) {
							// send the changed field to other players as well
							PlayerManager.getOtherPlayers(player, function (otherPlayer) {
								otherPlayer.getSocket().emit('cardPlaySelectTarget_resp', {field: GameField.forPlayer(otherPlayer, fieldsToSend) /*must not send the card*/ });
							});					
						}
					},
					/*onFail*/function(error) {
						player.getSocket().emit('cardPlaySelectTargetFailed_resp', { cardId: data.cardIdToPlay, error : error });						
					}
				);
			});
		});
		/* A player clicked the button "round end". So we have to be in gameState==1. */
		socket.on('roundEnd_req', function(data) {
			logger.debug("[roundEnd_req] playerId:%s",data.playerId);	
			/*data={playerId}*/
			var GameManager = require("./rule_gamemanager.js");
			var PlayerManager = require("./rule_playermanager.js");
			PlayerManager.getPlayer(data.playerId, function(player) {			
				GameManager.getGame(player.gameId, function(game) {					
					GameManager.storeGame(game, function(gameToPrepare) {
						gameToPrepare.setPlayerDone(player);
					}, function(savedGame) {						
						savedGame.checkForNextTurn(); /* back: startAuction_resp */
					});
				});
			});
		});
		/* A player clicked the button "Set bidding". So we have to be in gameState==2. */
		socket.on('auctionBid_req', function(data) {
			logger.debug("[auctionBid_req] playerId:%s",data.playerId);	
			/*data={playerId, bid}*/
			var GameManager = require("./rule_gamemanager.js");
			var PlayerManager = require("./rule_playermanager.js");
			PlayerManager.getPlayer(data.playerId, function(player) {			
				if(!isNaN(data.bid) && data.bid >= 0 ) {
					GameManager.getGame(player.gameId, function(game) {					
						GameManager.storeGame(game, function(gameToPrepare) {
							gameToPrepare.setBidding(player, data.bid);
							gameToPrepare.setPlayerDone(player);
						}, function(savedGame) {
							savedGame.checkForNextTurn(); /* back: postAuctionSelection */
						});
					});
				} else {
					logger.warn("Player "+data.playerId+" send bid:"+data.bid);
				}
			});			
		});
		/* A player clicked the button "Pick card". So we have to be in gameState==3. */
		socket.on('postAuctionSelect_req', function(data) {
			logger.debug("[postAuctionSelect_req] playerId:%s, card:%s",data.playerId,data.cardId);	
			/*data={playerId, cardId}*/
			var GameManager = require("./rule_gamemanager.js");
			var PlayerManager = require("./rule_playermanager.js");			
			PlayerManager.getPlayer(data.playerId, function(player) {			
				GameManager.getGame(player.gameId, function(game) {					
					var selectedCard = null;
					GameManager.storeGame(game, function(gameToPrepare) {
						// try to get the selected card (if one was choosen)												
						if(data.cardId !== null) {
							selectedCard = gameToPrepare.removeCardFromAuction(data.cardId, player._id);						
						}
						logger.debug("[postAuctionSelect_req] Player "+player.playerName+" wanted to select card "+data.cardId+" and got "+(selectedCard!==null?selectedCard.id:"null"));
						// if the selected card is already given, use must select another one
						if(selectedCard !== null || data.cardId === null) {
							// we got the card or nothing was selected
							gameToPrepare.setPlayerDone(player);
						} else {
							socket.emit('postAuctionSelection', { gameState : gameToPrepare.gameState}); /* back: */
							return false; // we don't want to store the Game (ergo: onSuccess won't be called)
						}
					}, function(savedGame) {
						// either the selected card was successfully retrieved for the user or the user just didn't select anything
						if(data.cardId !== null) {
							if(savedGame.gameState == GameStates.PICK_CARD) {
								// since a card was selected in the auction-phase (initial phase uses this as well) inform other players that this one is removed now
								PlayerManager.getOtherPlayers(player, function(otherPlayer) {
									var psoc = require('./socket.js')(otherPlayer);
									psoc.emit('auctionCardRemove', { card: selectedCard } );
								});
							}
							// update the player (server&client) for the new card and check for "nextTurn"
							PlayerManager.storePlayer(player, function(playerToPrepare) {							
								playerToPrepare.cardHand.addTop(selectedCard);
							}, function(savedPlayer) {							
								socket.emit('card', { cards: [selectedCard] });
								savedGame.checkForNextTurn(); /* back: showFieldPane */
							});
						} else {
							// we don't have to update the client, since the user didn't select any card, but we have to check for "textTurn"
							savedGame.checkForNextTurn(); /* back: showFieldPane */
						}
					});						
				});
			});						
		});
		/* A player clicked on the infobar and wants to see the other players balance */
		socket.on('requestAllPlayerData_req', function(data) {
			logger.debug("[requestAllPlayerData_req] playerId:%s", data.playerId);	
			var PlayerManager = require("./rule_playermanager.js");
			PlayerManager.getPlayer(data.playerId, function(player) {
				PlayerManager.getPlayers(player.gameId, null, function(allPlayer) {
					var retList = [];
					allPlayer.forEach(function(player){
						retList.push({ name: player.playerName, money: player.money, conn: (player.socketId!==null) });
					});
					socket.emit('requestAllPlayerData_resp', retList);
				});
			});
		});
		/* A player disconnected ;) */
		socket.on('disconnect', function (data) {
			logger.debug("[disconnect] playerId:%s", socket.id);	
			var Game = require("./rule_game.js");
			Game.removePlayer(socket.id, function(game) {
				// player removed and game is still available
				if(game.gameState == GameStates.WAITING_FOR_PLAYERS) {
					var msg = { playerName: game.playerNames, clear: true};
					var PlayerManager = require("./rule_playermanager.js");
					PlayerManager.getPlayers(game._id, function(aPlayer) {
						aPlayer.getSocket().emit('waitAddPlayer_resp', msg);
					});							
				} else {
					// if the last player left the game, don't do anything (if we call checkForNextTurn we would end the turn)
					logger.debug("[disconnect] game.playerNames=%j", game.playerNames);
					game.allPlayersOffline(function(allOffline) {
						if(!allOffline) {
							game.checkForNextTurn();
							var PlayerManager = require("./rule_playermanager.js");
							PlayerManager.getPlayers(game._id, function(player) {
								if(player.socketId !== null) {
									var psoc = require('./socket.js')(player);
									psoc.emit('infoBar', game.constructMsgInfoBar(player));
								}
							});
						}
					});
				}
			}, function(players) {
				// game was deleted			
				players.forEach(function(player) {
					player.getSocket().emit('gameCanceled');
				});
			});	
		});
	});	
}

