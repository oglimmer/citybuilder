var Player = require("./rule_player.js");
var CardStack = require("./rule_cardstack.js");
var GameField = require('./rule_gamefield.js');
var Field = require('./rule_field.js');
var CardFactory = require('./rule_cardfactory.js');
var MonthHelper = require('./rule_dateutil.js');
var FieldType = require("./rule_defines.js").FieldType;
var log4js = require('log4js');
var logger = log4js.getLogger('game');
var AllCards = require('./rule_card.js');
var HouseTypeMaxPop = require("./rule_defines.js").HouseTypeMaxPop;
var HouseTypeReverse = require("./rule_defines.js").HouseTypeReverse;
var GameStates = require("./rule_defines.js").GameStates;

function Game() {
	this.clazz = "Game";
	this.playerIds = {}; // k=player.number, v=player.id
	this.playerNames = [];
	
	this.biddings = {};
	this.auctionTakeOrder = [];
	this.cardsToAuction = [];

	this.maxPlayerNumber = 0;

	/* 0 = game created, but waiting for players
	 * 1 = deploy card
	 * 2 = set bid
	 * 3 = select card for auction
	 * 4 = initial card selection
	 */
	this.gameState = GameStates.WAITING_FOR_PLAYERS;

	this.currentDate = new MonthHelper();
	this.gameField = new GameField(this);
	this.cardsCommercial = new CardStack();
	this.cardsMisc = new CardStack();
	this.initTurn();
}

Game.prototype.startGame = function(playTime, allPlayers) {
	this.playTime = playTime;
	this.gameState = GameStates.PICK_INITIAL_CARD;
	this.cardsCommercial.create(0, 1);
	allPlayers.forEach(function(player) {
		if(this.cardsCommercial.length() < 4) {
			this.cardsCommercial.clear();
			this.cardsCommercial.create(0, 1);
		}
		var cardsToSelect = [];
		for(var i = 0 ; i < 4 ; i++) {
			cardsToSelect.push(this.cardsCommercial.removeTop());
		}
		this.cardsToAuction.push({playerId: player._id, cardsToSelect: cardsToSelect});
	}.bind(this));
	this.cardsCommercial.clear();
	this.cardsCommercial.create(0, CardStack.NUMBER_PER_CARD);
	this.cardsMisc.create(1, CardStack.NUMBER_PER_CARD);
}

Game.prototype.createPlayer = function(socketId, playerName, onCreated) {
	var newPlayer = new Player(this, socketId, playerName);
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	PlayerManager.storePlayer(newPlayer, null, function(savedPlayer) {
		// update Game object with added player (and increased player no)
		var nextPlayerNo;
		GameManager.storeGame(this, function(gameToPrepare) {
			nextPlayerNo = gameToPrepare.maxPlayerNumber++;
			gameToPrepare.playerIds[nextPlayerNo] = savedPlayer._id;			
			gameToPrepare.playerNames.push(playerName);
			gameToPrepare.playersOnTurn.push(savedPlayer._id);
		}, function() {
			// on success save the player again
			PlayerManager.storePlayer(savedPlayer, function(latestPlayer) {
				latestPlayer.no = nextPlayerNo;
			}, function(finalSavedPlayer) {
				onCreated(finalSavedPlayer);
			});			
		});
	}.bind(this));
};

Game.prototype.rejoinPlayer = function(socketId, player, onSuccess) {
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	PlayerManager.storePlayer(player, function(player) {
		player.socketId = socketId;	
	}, function(savedPlayer) {
		GameManager.storeGame(this, function(gameToPrepare) {
			//gameToPrepare.playerIds[player.no] = player._id;			
			//gameToPrepare.playerNames.push(player.playerName);
			//gameToPrepare.playersOnTurn.push(player._id);
		}, function(savedGame) {
			onSuccess(savedPlayer);
		});
	}.bind(this));
};

Game.removePlayer = function(socketId, onSuccess, onGameDeleted) {
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	PlayerManager.getPlayerBySocketId(socketId, function(player) {
		GameManager.getGame(player.gameId, function(game) {
			if(game.gameState == GameStates.WAITING_FOR_PLAYERS && (game.playerNames.length == 1 || game.playerNames[0] == player.playerName)) {
				logger.debug("[removePlayer] removed last/first player during WAITING_FOR_PLAYERS...deleting game. %s", game._id);
				PlayerManager.getPlayers(game._id, null, function(allPlayers) {
					onGameDeleted(allPlayers);
					GameManager.deleteGame(game);
				});				
			} else {
				PlayerManager.storePlayer(player, function(player) {
					player.socketId = null;	
					GameManager.storeGame(game, function(gameToPrepare) {
						if(gameToPrepare.gameState == GameStates.WAITING_FOR_PLAYERS) {
							delete gameToPrepare.playerIds[player.no];
							gameToPrepare.playerNames.removeByObj(player.playerName);
							gameToPrepare.playersOnTurn.removeByObj(player._id);
						}
					}, function(savedGame) {
						onSuccess(savedGame);
					});
				});
			}
		});
	});
};

Game.prototype.initTurn = function() {
	this.playersOnTurn = [];
	for(var k in this.playerIds) {
		var v = this.playerIds[k];
		this.playersOnTurn.push(v);
	}
}

Game.prototype.setPlayerDone = function(player) {
	for(var i = 0 ; i < this.playersOnTurn.length ; i++) {
		if(this.playersOnTurn[i] == player._id) {
			this.playersOnTurn.splice(i,1);
			break;
		}
	}
}

Game.prototype.isPlayerDone = function(player) {
	for(var i = 0 ; i < this.playersOnTurn.length ; i++) {
		if(this.playersOnTurn[i] == player._id) {			
			return false;
		}
	}
	return true;
}

Game.prototype.allPlayersDone = function(callback) {
	var PlayerManager = require("./rule_playermanager.js");
	PlayerManager.getPlayers(this._id, null, function(allPlayers) {
		logger.debug("[allPlayersDone] allPlayers.length="+allPlayers.length);
		var atLeastOnePlayerInTurn = false;
		this.playersOnTurn.forEach(function(playerIdOnTurn) {
			var player = allPlayers.getPlayerById(playerIdOnTurn);	
			if(player.socketId !== null) {
				atLeastOnePlayerInTurn = true;
			}
		}.bind(this));
		logger.debug("[allPlayersDone] atLeastOnePlayerInTurn="+atLeastOnePlayerInTurn);
		callback(!atLeastOnePlayerInTurn);
	}.bind(this));
}

Game.prototype.allPlayersOffline = function(callback) {
	var PlayerManager = require("./rule_playermanager.js");
	PlayerManager.getPlayers(this._id, null, function(allPlayers) {
		var atLeastOnePlayerOnline = false;
		allPlayers.forEach(function(player) {
			if(player.socketId !== null) {
				atLeastOnePlayerOnline = true;
			}
		}.bind(this));
		logger.debug("[allPlayersOffline] atLeastOnePlayerOnline="+atLeastOnePlayerOnline);
		callback(!atLeastOnePlayerOnline);
	}.bind(this));	
}

Game.prototype.atLeastOneOnline = function(playerIds, callback) {
	var PlayerManager = require("./rule_playermanager.js");
	PlayerManager.getPlayers(this._id, null, function(allPlayers) {
		var atLeastOnePlayerOnline = false;
		allPlayers.forEach(function(player) {
			if(player.socketId !== null && playerIds.in(player._id)) {
				atLeastOnePlayerOnline = true;
			}
		}.bind(this));
		logger.debug("[atLeastOneOnline] atLeastOnePlayerOnline="+atLeastOnePlayerOnline);
		callback(atLeastOnePlayerOnline);
	}.bind(this));	
}

Game.prototype.checkForNextTurn = function() {
	logger.debug("[checkForNextTurn] gameState="+this.gameState);
	this.allPlayersDone(function(allDone) {
		if(allDone) {
			var PlayerManager = require("./rule_playermanager.js");
			PlayerManager.getPlayers(this._id, null, function(allPlayers) {			
				if(this.gameState == GameStates.CITY_VIEW) {
					this.processNextTurn(allPlayers);
				} else if(this.gameState == GameStates.SET_BIDDING) {
					this.processAuctionBid(allPlayers);
				} else if(this.gameState == GameStates.PICK_CARD) {
					if(this.auctionTakeOrder.length > 0) {
						// no all players picked their card yet
						this.processPostAuctionSelection();
					} else {
						// all cards picked, go to next turn
						this.processAuctionSelect(allPlayers);
					}
				} else if(this.gameState == GameStates.PICK_INITIAL_CARD) {
					this.initialCardSelectionDone(allPlayers);
				}
			}.bind(this));
		}
	}.bind(this));
}

Game.prototype.initialCardSelectionDone = function(allPlayers) {
	logger.debug("[initialCardSelectionDone] start");

	this.gameState = GameStates.CITY_VIEW;
	this.initTurn();
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);
	allPlayers.forEach(function(player) {
		var psoc = require('./socket.js')(player);
		psoc.sendInitUIElements(this);
	}.bind(this));
}

Game.prototype.processAuctionSelect = function(allPlayers) {
	logger.debug("[processAuctionSelect] start");

	this.gameState = GameStates.CITY_VIEW;
	this.initTurn();
	var lastBiddings = [];
	allPlayers.forEach(function(player) {
		var bid = this.biddings[player._id];
		if(typeof(bid) !== 'undefined') {
			lastBiddings.push({playerName : player.playerName, bid : bid.originalBid, cost : bid.acutalCost});
		} else {
			lastBiddings.push({playerName : player.playerName, bid:0,cost:0});
		}
	}.bind(this));
	this.biddings = {};
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);
	allPlayers.forEach(function(player) {
		var psoc = require('./socket.js')(player);	
		psoc.sentshowFieldPane({ gameState : this.gameState, lastBids : lastBiddings });
	}.bind(this));
}

Game.prototype.payBid = function(playerIds, allPlayers, part) {
	var PlayerManager = require("./rule_playermanager.js");
	playerIds.forEach(function(pId) {
		var player = allPlayers.getPlayerById(pId);
		var bid = this.biddings[pId];
		var cost = bid.originalBid * part;
		bid.acutalCost = cost;
		logger.debug("[payBid] Player "+player.playerName+" bid $"+bid.originalBid+" by "+part+"= $"+cost);
		player.money -= cost;
		PlayerManager.storePlayer(player, null);		
	}.bind(this));
	allPlayers.forEach(function(player) {
		if(player.money < 0) {
			// pay interest for debts 
			var interest= player.money*0.03;
			logger.debug("[payBid] Player "+player.playerName+" paid $"+interest+" interest");
			player.money -= interest;
		}
	});
}

Game.prototype.processAuctionBid = function(allPlayers) {
	logger.debug("[processAuctionBid] start. this.biddings=%j", this.biddings);

	this.gameState = GameStates.PICK_CARD;
	// if a player had left the game and rejoined again his bidding is undefined. So tread this as $0.
	allPlayers.forEach(function(player) {
		if(player.socketId !== null && typeof(this.biddings[player._id]) === 'undefined') {
			this.biddings[player._id] = { originalBid: 0, acutalCost: 0 };
			logger.debug("[processAuctionBid] added 0-bidding:%s", player.playerName);
		}
	}.bind(this));

	// order by bid and create turn order
	this.auctionTakeOrder = [];
	var tmpBiddings = JSON.parse(JSON.stringify(this.biddings)); // deep-copy
	var tmpAllPlayers = allPlayers.asIdArray();
	logger.debug("[processAuctionBid] tmpAllPlayers:%j", tmpAllPlayers);
	while(Object.keys(tmpBiddings).length !== 0) {

		logger.debug("[processAuctionBid] run:"+Object.keys(tmpBiddings).length);

		var maxBid = -1;
		var maxBidders;
		for(var playerId in tmpBiddings) {
			var originalBid = parseInt(tmpBiddings[playerId].originalBid);
			if(maxBid < originalBid) {
				maxBid = originalBid;
				maxBidders = [playerId];				
			} else if(maxBid == originalBid) {
				maxBidders.push(playerId);
			}
		}

		logger.debug("[processAuctionBid] maxBid:%d, maxBidders:%j", maxBid, maxBidders);

		maxBidders.forEach(function(oneMaxBidder) {
			delete tmpBiddings[oneMaxBidder];
			tmpAllPlayers.removeByObj(oneMaxBidder);
		});
		this.auctionTakeOrder.push(maxBidders);
	}

	// calc final bid cost and subtract money
	this.payBid(this.auctionTakeOrder[0], allPlayers, 1);
	for(var i = 1 ; i < this.auctionTakeOrder.length-1 ; i++) {
		var max = this.auctionTakeOrder.length-1;
		var part = (1/max)*(max-i);
		this.payBid(this.auctionTakeOrder[i], allPlayers, part);		
	}

	// if there are players who haven't bid anything, add them as a last round
	if(tmpAllPlayers.length > 0) {
		this.auctionTakeOrder.push(tmpAllPlayers);
		logger.debug("[processAuctionBid] added final round for non-bidders: %j", tmpAllPlayers);
	}

	this.doNextAuctionPickCard(allPlayers);
}

Game.prototype.processPostAuctionSelection = function() {
	logger.debug("[processPostAuctionSelection] start");
	var PlayerManager = require("./rule_playermanager.js");
	PlayerManager.getPlayers(this._id, null, function(allPlayers) {			
		this.doNextAuctionPickCard(allPlayers);
	}.bind(this));
}

Game.prototype.doNextAuctionPickCard = function(allPlayers) {
	logger.debug("[doNextAuctionPickCard] start. auctionTakeOrder=%d", this.auctionTakeOrder.length);
	if(this.auctionTakeOrder.length == 0 ) {
		this.checkForNextTurn();
	} else {
		/* readies the next player(s) for the given bid
		 * => puts them into playersOnTurn, and send message over */
		var	nextPlayerIds = this.auctionTakeOrder.shift();
		logger.debug("[doNextAuctionPickCard] nextPlayerIds=%j", nextPlayerIds);
		this.atLeastOneOnline(nextPlayerIds, function(atLeastOnePlayerOnline) {
			if(!atLeastOnePlayerOnline) {
				this.doNextAuctionPickCard(allPlayers);
			} else {
				this.playersOnTurn = JSON.parse(JSON.stringify(nextPlayerIds)); // deep-copy
				
				var GameManager = require("./rule_gamemanager.js");
				GameManager.storeGame(this, null);

				nextPlayerIds.forEach(function(playerId) {
					var player = allPlayers.getPlayerById(playerId);
					var psoc = require('./socket.js')(player);	
					psoc.sendPostAuctionSelection({ gameState : this.gameState, money: player.money });					
				}.bind(this));
			}
		}.bind(this));
	}
}

Game.prototype.removeCardFromAuction = function(cardId, playerId) {
	var c = null;
	if(this.gameState == GameStates.PICK_CARD) {
		for(var i = 0 ; i < this.cardsToAuction.length ; i++) {
			if(this.cardsToAuction[i].id == cardId) {
				c = this.cardsToAuction[i];
				this.cardsToAuction.splice(i,1);
			}
		}
	} else {
		for(var j = 0 ; j < this.cardsToAuction.length ; j++) {
			if( this.cardsToAuction[j].playerId == playerId ) {
				for(var i = 0 ; i < this.cardsToAuction[j].cardsToSelect.length ; i++) {
					if(this.cardsToAuction[j].cardsToSelect[i].id == cardId) {
						c = this.cardsToAuction[j].cardsToSelect[i];
					}
				}		
			}
		}
	}
	logger.debug("[removeCardFromAuction] requested:%d, got:%d",cardId,(c!=null?c.id:"-1"));
	return c;
}

Game.prototype.processNextTurn = function(allPlayers) {
	logger.debug("[processNextTurn] start");

	this.gameState = GameStates.SET_BIDDING;

	var changedFields = this.growCity();

	this.resetSuppliesAndCalcBuildstate(changedFields);

	this.calcLocalLevel(changedFields); // no dependency, set:localLevel

	this.doSocialChanges(); // depends on localLevel, set:attachedCard.houseType

	this.calcSupplies(); // depends on profit(attachedCard.houseType), set:supply

	var incomeReceipt = this.calcIncome(allPlayers); // depends on supply and profit(attachedCard.houseType)

	this.currentDate.nextMonth();
	this.playTime--;
	this.initTurn();
	if(this.playTime == 0) {
		this.processEndGame(allPlayers);
	} else {
		var cardsToAuction = [];
		for(var i = 0 ; i < allPlayers.length ; i++) {
			cardsToAuction.push(this.cardsCommercial.removeTop());
		}
		cardsToAuction.push(this.cardsMisc.removeTop());
		this.sendAuction(allPlayers, changedFields, cardsToAuction, incomeReceipt);
	}	
}

Game.prototype.growCity = function() {
	var houseType = Math.floor((Math.random()*3))*3+3; // random = {3,6,9}
	return this.gameField.add(3,3,houseType, HouseTypeMaxPop[HouseTypeReverse[houseType]], houseType==3?30:houseType==6?0:-10);
}

Game.prototype.sendAuction = function(allPlayers, changedFields, cardsToAuction, incomeReceipt) {
	this.cardsToAuction = cardsToAuction;
	allPlayers.forEach(function(player) {
		this.sendAuctionToPlayer(player, changedFields, incomeReceipt);
	}.bind(this));
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);		
}

Game.prototype.sendAuctionToPlayer = function(player, changedFields, incomeReceipt) {
	player.availableActions |= 1; // a card is deployable
	var newTurnData = this.constructNewTurnData(player, changedFields, incomeReceipt);	
	var PlayerManager = require("./rule_playermanager.js");
	PlayerManager.storePlayer(player,null, function(savedPlayer) {
		require('./socket.js')(savedPlayer).startAuction(newTurnData);
	});	
}

Game.prototype.resetSuppliesAndCalcBuildstate = function(changedFields) {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.buildState == 1) {
			field.buildState++;
			changedFields[field.x+":"+field.y] = field;
		}			
		if(field.type === FieldType.HOUSE) {
			field.attachedCard.supply = [];
			field.localLevel = field.baseLocalLevel;				
		} else {
			//CRAZINESS: add methods to this card
			AllCards.Card.reinit(field.attachedCard);
		}
	}
}

Game.prototype.calcSupplies = function() {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.type !== FieldType.HOUSE) {			
			field.attachedCard.calcSupplies(field, this.gameField.fields);
		}
	}
}

Game.prototype.calcLocalLevel = function(changedFields) {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.type !== FieldType.HOUSE) {
			field.attachedCard.calcLocalLevel(field, this.gameField.fields, changedFields);
		}
	}
}

Game.prototype.doSocialChanges = function() {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.type === FieldType.HOUSE) {
			Field.socialChange(field);
		}
	}		
}

Game.prototype.calcIncome = function(allPlayers) {
	var incomeReceipt = [];
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];
		if(field.type !== FieldType.HOUSE) {
			var player = allPlayers.getPlayerByNo(field.owner);
			var fieldIncome = field.attachedCard.calcRent(field, this.gameField.fields);
			player.money += fieldIncome;
			incomeReceipt.push([player.playerName,fieldIncome,field.attachedCard.title,field.x,field.y]);
		}
	}
	return incomeReceipt;
}

Game.prototype.processEndGame = function(allPlayers) {
	var winner = { player: null, maxMoney : -1, scoreList : [] };
	allPlayers.forEach(function(player) {
		if(player.money > winner.maxMoney) {
			winner.playerName = player.playerName;
			winner.maxMoney = player.money;
		}
		winner.scoreList.push({playerName : player.playerName, money: player.money});
	});			
	allPlayers.forEach(function(player) {
		require('./socket.js')(player).sendEndGame({ winner: winner});				
	});
	var GameManager = require("./rule_gamemanager.js");
	GameManager.deleteGame(this);
}

Game.prototype.constructMsgInfoBar = function(player) {
	return {
		gameState : this.gameState,
		money : player.money,
		playerNumber : this.playerNames.length,
		currentDate : this.currentDate.toString() +" ("+this.playTime+")"
	};
}

Game.prototype.constructNewTurnData = function(player, changedFields, incomeReceipt) {
	return {
		gameState : this.gameState,
		infoBar : this.constructMsgInfoBar(player),
		uiElement : changedFields,
		availableActions : player.availableActions,
		cardsToAuction : this.cardsToAuction,
		incomeReceipt : incomeReceipt
	};	
}

Game.prototype.setBidding = function(player, bid) {
	logger.debug("[setBidding] Accepted bid for player "+player.playerName+" : -"+bid+"-");
	this.biddings[player._id] = { acutalCost: 0, originalBid: bid};	
}

Game.reinit = function(body) {
	body.__proto__ = Game.prototype;
	CardStack.reinit(body.cardsCommercial);
	CardStack.reinit(body.cardsMisc);
	GameField.reinit(body.gameField);
	MonthHelper.reinit(body.currentDate);	
}

module.exports = Game;