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
	this.gameState = 0;

	this.currentDate = new MonthHelper();
	this.gameField = new GameField(this);
	this.cards = new CardStack();	
	this.initTurn();
}

Game.prototype.startGame = function(playTime, allPlayers) {
	this.playTime = playTime;
	this.gameState = 4;
	this.cards.create(0);
	var self = this;
	allPlayers.forEach(function(doc) {
		var player = doc.value;
		if(self.cards.length() < 4) {
			self.cards.clear();
			self.cards.create(0);
		}
		var cardsToSelect = [];
		for(var i = 0 ; i < 4 ; i++) {
			cardsToSelect.push(self.cards.removeTop());
		}
		self.cardsToAuction.push({playerId: player._id, cardsToSelect: cardsToSelect});
	});
	self.cards.clear();
	self.cards.create(1);
}

Game.prototype.createPlayer = function(socketId, playerName, onCreated) {
	var self = this;
	var newPlayer = new Player(this, socketId, playerName);
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	PlayerManager.storePlayer(newPlayer, null, function(savedPlayer) {
		// update Game object with added player (and increased player no)
		var nextPlayerNo;
		GameManager.storeGame(self, function(gameToPrepare) {
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
	})	
};

Game.prototype.rejoinPlayer = function(socketId, player, onSuccess) {
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	var self = this;
	PlayerManager.storePlayer(player, function(player) {
		player.socketId = socketId;	
	}, function(savedPlayer) {
		GameManager.storeGame(self, function(gameToPrepare) {
			gameToPrepare.playerIds[player.no] = player._id;			
			gameToPrepare.playerNames.push(player.playerName);
			//gameToPrepare.playersOnTurn.push(player._id);
		}, function(savedGame) {
			onSuccess(savedPlayer);
		});
	});
};

Game.removePlayer = function(socketId, onSuccess) {
	var PlayerManager = require('./rule_playermanager.js');
	var GameManager = require('./rule_gamemanager.js');
	PlayerManager.getPlayerBySocketId(socketId, function(player) {			
		PlayerManager.storePlayer(player, function(player) {
			player.socketId = null;	
			GameManager.getGame(player.gameId, function(game) {
				GameManager.storeGame(game, function(gameToPrepare) {
					delete gameToPrepare.playerIds[player.no];
					gameToPrepare.playerNames.removeByObj(player.playerName);
					gameToPrepare.playersOnTurn.removeByObj(player._id);					
				}, function(savedGame) {
					onSuccess(savedGame);
				});
			});
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

Game.prototype.allPlayersDone = function() {
	return this.playersOnTurn.length == 0;
}

Game.prototype.checkForNextTurn = function() {
	logger.debug("[checkForNextTurn] gameState="+this.gameState);
	var self = this;
	if(self.allPlayersDone()) {		
		var PlayerManager = require("./rule_playermanager.js");
		PlayerManager.getPlayers(self._id, null, function(allPlayers) {			
			if(self.gameState == 1) {
				self.processNextTurn(allPlayers);
			} else if(self.gameState == 2) {
				self.processAuctionBid(allPlayers);
			} else if(self.gameState == 3) {
				if(self.auctionTakeOrder.length > 0) {
					// no all players picked their card yet
					self.processPostAuctionSelection();
				} else {
					// all cards picked, go to next turn
					self.processAuctionSelect(allPlayers);
				}
			} else if(self.gameState == 4) {
				self.initialCardSelectionDone(allPlayers);
			}
		});
	}
}

Game.prototype.initialCardSelectionDone = function(allPlayers) {
	this.gameState = 1;
	this.initTurn();
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);
	var self = this;
	allPlayers.forEach(function(player) {
		var psoc = require('./socket.js')(player.value);
		psoc.sendInitUIElements(self);
	});				
}

Game.prototype.processAuctionSelect = function(allPlayers) {
	this.gameState = 1;
	this.initTurn();
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);
	var self = this;
	allPlayers.forEach(function(player) {
		var psoc = require('./socket.js')(player.value);	
		psoc.sentshowFieldPane({ gameState : self.gameState });
	});
}

Game.prototype.payBid = function(playerIds, allPlayers, part, biddingsTmp) {
	var PlayerManager = require("./rule_playermanager.js");
	playerIds.forEach(function(pId) {
		var player = allPlayers.getPlayerById(pId);
		var cost = biddingsTmp[pId] * part;
		logger.debug("[payBid] Player "+player.playerName+" paid "+biddingsTmp[pId]+" by "+part+"="+cost);
		player.money -= cost;
		PlayerManager.storePlayer(player, null);		
	});
}

Game.prototype.processAuctionBid = function(allPlayers) {
	this.gameState = 3;
	var self = this;
	// if a player had left the game and rejoined again his bidding is undefined. So tread this as $0.
	allPlayers.forEach(function(pla) {
		var player = pla.value;
		if(player.socketId !== null && typeof(self.biddings[player._id]) === 'undefined') {
			self.biddings[player._id] = 0;
		}
	});
	// order by bid and create turn order
	this.auctionTakeOrder = [];
	var biddingsTmp = JSON.parse(JSON.stringify(this.biddings));
	while(Object.keys(this.biddings).length !== 0) {
		var maxBid = -1;
		var maxBidders;
		for(var playerId in this.biddings) {
			var bid = parseInt(this.biddings[playerId]);
			if(maxBid < bid) {
				maxBid = bid;
				maxBidders = [playerId];
			} else if(maxBid == bid) {
				maxBidders.push(playerId);
			}
		}
		var self = this;
		maxBidders.forEach(function(oneMaxBidder) {
			delete self.biddings[oneMaxBidder];	
		});
		this.auctionTakeOrder.push(maxBidders);
	}
	// calc final bid cost and subtract money
	this.payBid(this.auctionTakeOrder[0], allPlayers, 1, biddingsTmp);
	for(var i = 1 ; i < this.auctionTakeOrder.length-1 ; i++) {
		var max = this.auctionTakeOrder.length-1;
		var part = (1/max)*(max-i);
		this.payBid(this.auctionTakeOrder[i], allPlayers, part, biddingsTmp);
	}

	this.doNextAuctionPickCard(allPlayers);
}

Game.prototype.processPostAuctionSelection = function() {
	var PlayerManager = require("./rule_playermanager.js");
	var self = this;
	PlayerManager.getPlayers(this._id, null, function(allPlayers) {			
		self.doNextAuctionPickCard(allPlayers);
	});
}

Game.prototype.doNextAuctionPickCard = function(allPlayers) {
	/* readies the next player(s) for the given bid
	 * => puts them into playersOnTurn, and send message over */
	var nextPlayerIds = this.auctionTakeOrder.shift();

	if(typeof(nextPlayerIds) === 'undefined') {
		console.trace("[doNextAuctionPickCard] nextPlayerIds is undefined")
	}

	this.playersOnTurn = JSON.parse(JSON.stringify(nextPlayerIds)); // deep-copy
	
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);

	var self = this;
	nextPlayerIds.forEach(function(playerId) {
		var player = allPlayers.getPlayerById(playerId);
		var psoc = require('./socket.js')(player);	
		psoc.sendPostAuctionSelection({ gameState : self.gameState, money: player.money });					
	});
}

Game.prototype.removeCardFromAuction = function(cardId, playerId) {
	var c = null;
	if(this.gameState == 3) {
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
	logger.debug("removeCardFromAuction = " + (c !== null ? c.title : cardId+" not got!"));
	return c;
}

Game.prototype.processNextTurn = function(allPlayers) {
	this.gameState = 2;

	var changedFields = this.growCity();

	this.resetSuppliesAndCalcBuildstate(changedFields);

	this.calcLocalLevel(changedFields); // no dependency, set:localLevel

	this.doSocialDowngrades(); // depends on localLevel, set:attachedCard.houseType

	this.calcSupplies(); // depends on profit(attachedCard.houseType), set:supply

	var incomeReceipt = this.calcIncome(allPlayers); // depends on supply and profit(attachedCard.houseType)

	this.currentDate.nextMonth();
	this.playTime--;
	this.initTurn();
	if(this.playTime == 0) {
		this.processEndGame(allPlayers);
	} else {
		var cardsToAuction = [];
		for(var i = 0 ; i < allPlayers.length + 1 ; i++) {
			cardsToAuction.push(this.cards.removeTop());
		}
		this.sendAuction(allPlayers, changedFields, cardsToAuction, incomeReceipt);
	}	
}

Game.prototype.growCity = function() {
	var houseType = Math.floor((Math.random()*3))*3+3; // random = {3,6,9}
	return this.gameField.add(3,3,houseType, HouseTypeMaxPop[HouseTypeReverse[houseType]], houseType==3?30:houseType==6?0:-10);
}

Game.prototype.sendAuction = function(allPlayers, changedFields, cardsToAuction, incomeReceipt) {
	var self = this;
	self.cardsToAuction = cardsToAuction;
	allPlayers.forEach(function(doc) {
		self.sendAuctionToPlayer(doc.value, changedFields, incomeReceipt);
	});
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(self, null);		
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

Game.prototype.doSocialDowngrades = function() {
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];			
		if(field.type === FieldType.HOUSE) {
			Field.downgrade(field);
		}
	}		
}

Game.prototype.calcIncome = function(allPlayers) {
	var incomeReceipt = [];
	for(var k in this.gameField.fields) {
		var field = this.gameField.fields[k];
		if(field.type !== FieldType.HOUSE) {
			var p = allPlayers.getPlayer(field.owner);
			var fieldIncome = field.attachedCard.calcRent(field, this.gameField.fields);
			p.money += fieldIncome;
			incomeReceipt.push([p.playerName,fieldIncome,field.attachedCard.title,field.x,field.y]);
		}
	}
	return incomeReceipt;
}

Game.prototype.processEndGame = function(allPlayers) {
	var winner = { player: null, maxMoney : -1, scoreList : [] };
	allPlayers.forEach(function(p) {
		var player = p.value;
		if(player.money > winner.maxMoney) {
			winner.playerName = player.playerName;
			winner.maxMoney = player.money;
		}
		winner.scoreList.push({playerName : player.playerName, money: player.money});
	});			
	allPlayers.forEach(function(p) {
		var player = p.value;
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
	logger.debug("Accepted bid for player "+player.playerName+" : -"+bid+"-");
	this.biddings[player._id] = bid;	
}

Game.reinit = function(body) {
	body.__proto__ = Game.prototype;
	CardStack.reinit(body.cards);
	GameField.reinit(body.gameField);
	MonthHelper.reinit(body.currentDate);	
}

module.exports = Game;