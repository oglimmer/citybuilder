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
	this.cardsCommercial = new CardStack();
	this.cardsMisc = new CardStack();
	this.initTurn();
}

Game.prototype.startGame = function(playTime, allPlayers) {
	this.playTime = playTime;
	this.gameState = 4;
	this.cardsCommercial.create(0, 1);
	allPlayers.forEach(function(doc) {
		var player = doc.value;
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
			gameToPrepare.playerIds[player.no] = player._id;			
			gameToPrepare.playerNames.push(player.playerName);
			//gameToPrepare.playersOnTurn.push(player._id);
		}, function(savedGame) {
			onSuccess(savedPlayer);
		});
	}.bind(this));
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
	if(this.allPlayersDone()) {		
		var PlayerManager = require("./rule_playermanager.js");
		PlayerManager.getPlayers(this._id, null, function(allPlayers) {			
			if(this.gameState == 1) {
				this.processNextTurn(allPlayers);
			} else if(this.gameState == 2) {
				this.processAuctionBid(allPlayers);
			} else if(this.gameState == 3) {
				if(this.auctionTakeOrder.length > 0) {
					// no all players picked their card yet
					this.processPostAuctionSelection();
				} else {
					// all cards picked, go to next turn
					this.processAuctionSelect(allPlayers);
				}
			} else if(this.gameState == 4) {
				this.initialCardSelectionDone(allPlayers);
			}
		}.bind(this));
	}
}

Game.prototype.initialCardSelectionDone = function(allPlayers) {
	this.gameState = 1;
	this.initTurn();
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);
	allPlayers.forEach(function(player) {
		var psoc = require('./socket.js')(player.value);
		psoc.sendInitUIElements(this);
	}.bind(this));
}

Game.prototype.processAuctionSelect = function(allPlayers) {
	this.gameState = 1;
	this.initTurn();
	var GameManager = require("./rule_gamemanager.js");
	GameManager.storeGame(this, null);
	var lastBiddings = [];
	allPlayers.forEach(function(pl) {
		var player = pl.value;
		var bid = this.biddings[player._id];
		if(typeof(bid.originalBid) !== 'undefined' && typeof(bid.acutalCost) !== 'undefined') {
			lastBiddings.push({playerName : player.playerName, bid : bid.originalBid, cost : bid.acutalCost});
		} else {
			// the last bid (which pays $0) is not processed, therefore we dont have originalBid and acutalCost
			lastBiddings.push({playerName : player.playerName, bid : bid,cost:0});
		}
	}.bind(this));
	allPlayers.forEach(function(player) {
		var psoc = require('./socket.js')(player.value);	
		psoc.sentshowFieldPane({ gameState : this.gameState, lastBids : lastBiddings });
	}.bind(this));
}

Game.prototype.payBid = function(playerIds, allPlayers, part) {
	var PlayerManager = require("./rule_playermanager.js");
	playerIds.forEach(function(pId) {
		var player = allPlayers.getPlayerById(pId);
		var bid = this.biddings[pId];
		var cost = bid * part;
		this.biddings[pId] = {originalBid: bid, acutalCost: cost};
		logger.debug("[payBid] Player "+player.playerName+" bid $"+bid+" by "+part+"= $"+cost);
		player.money -= cost;
		PlayerManager.storePlayer(player, null);		
	}.bind(this));
	allPlayers.forEach(function(pl) {
		var player = pl.value;
		if(player.money < 0) {
			// pay interest for debts 
			var interest= player.money*0.03;
			logger.debug("[payBid] Player "+player.playerName+" paid $"+interest+" interest");
			player.money -= interest;
		}
	});
}

Game.prototype.processAuctionBid = function(allPlayers) {
	this.gameState = 3;
	// if a player had left the game and rejoined again his bidding is undefined. So tread this as $0.
	allPlayers.forEach(function(pla) {
		var player = pla.value;
		if(player.socketId !== null && typeof(this.biddings[player._id]) === 'undefined') {
			this.biddings[player._id] = 0;
		}
	}.bind(this));
	// order by bid and create turn order
	this.auctionTakeOrder = [];
	var tmpBiddings = JSON.parse(JSON.stringify(this.biddings)); // deep-copy
	while(Object.keys(tmpBiddings).length !== 0) {
		var maxBid = -1;
		var maxBidders;
		for(var playerId in tmpBiddings) {
			var bid = parseInt(tmpBiddings[playerId]);
			if(maxBid < bid) {
				maxBid = bid;
				maxBidders = [playerId];
			} else if(maxBid == bid) {
				maxBidders.push(playerId);
			}
		}
		maxBidders.forEach(function(oneMaxBidder) {
			delete tmpBiddings[oneMaxBidder];	
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

	this.doNextAuctionPickCard(allPlayers);
}

Game.prototype.processPostAuctionSelection = function() {
	var PlayerManager = require("./rule_playermanager.js");
	PlayerManager.getPlayers(this._id, null, function(allPlayers) {			
		this.doNextAuctionPickCard(allPlayers);
	}.bind(this));
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

	nextPlayerIds.forEach(function(playerId) {
		var player = allPlayers.getPlayerById(playerId);
		var psoc = require('./socket.js')(player);	
		psoc.sendPostAuctionSelection({ gameState : this.gameState, money: player.money });					
	}.bind(this));
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
	allPlayers.forEach(function(doc) {
		this.sendAuctionToPlayer(doc.value, changedFields, incomeReceipt);
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
	CardStack.reinit(body.cardsCommercial);
	CardStack.reinit(body.cardsMisc);
	GameField.reinit(body.gameField);
	MonthHelper.reinit(body.currentDate);	
}

module.exports = Game;