/* ------------------------------------------ */
/* class ServerCommListener */
/* ------------------------------------------ */
function ServerCommListener() {	
	var time = null;
	this.showWaitOverlay = function() {
		$('#overlay').show();
		time = new Date();
	}
	this.hideWaitOverlay = function() {
		$('#overlay').hide();
		console.log((new Date()) - time);
	}
	/*socket is a global variable*/
	this.init = function() {
		if(socket == null) {
			socket = io.connect(document.domain);
			socket.on('sendPlayerData', this.sendPlayerData.bind(this));
			socket.on('uiElement', this.uiElement.bind(this));	
			socket.on('infoBar', this.infoBar.bind(this));	
			socket.on('card', this.card.bind(this));	
			socket.on('prePlayCard_resp', this.prePlayCard_resp.bind(this));	
			socket.on('cardPlaySelectTarget_resp', this.cardPlaySelectTarget_resp.bind(this));
			socket.on('cardPlaySelectTargetFailed_resp', this.cardPlaySelectTargetFailed_resp.bind(this));
			socket.on('startAuction_resp', this.startAuction_resp.bind(this));
			socket.on('waitAddPlayer_resp', this.waitAddPlayer_resp.bind(this));
			socket.on('gamedEnded', this.gamedEnded.bind(this));
			socket.on('requestAllPlayerData_resp', this.requestAllPlayerData_resp.bind(this));
			socket.on('postAuctionSelection', this.postAuctionSelection.bind(this));
			socket.on('showFieldPane', this.showFieldPane.bind(this));
			socket.on('auctionCardRemove', this.auctionCardRemove.bind(this));
			socket.on('initialCardSelection', this.initialCardSelection.bind(this));
			socket.on('showWait', this.showWait.bind(this));
			socket.on('reconnect', this.reconnect.bind(this));
			socket.on('gameCanceled', this.gameCanceled.bind(this));
			// http://davidchambersdesign.com/getting-started-with-socket.io/
		}
	};
	this.reconnect = function() {
		socket.emit('reJoinGame_req', { reconnect: true, playerId: G.playerId, gameId: Cookie.get("gameId")});
	};
	this.gameCanceled = function() {
		$('#availGamesDiv').html("");
		$('#playerList').html("");		
		$('#top').show();
		$('#waitingForPlayers').hide();		
		changeHelp(0);
	}
	this.requestAllPlayerData = function() {
		socket.emit('requestAllPlayerData_req', {playerId : G.playerId});
	};
	this.requestAllPlayerData_resp = function(data) {
		data.sort(function(a,b) {
			return b.money-a.money;
		});
		G.allPlayersData = data;
		G.draw();
	};
	this.gamedEnded = function(data) {
		data.winner.scoreList.sort(function(a,b){
			return b.money - a.money;
		});		
		var html = '<h2>' + G.i18n.gameEnded_winner.replace('{0}',data.winner.playerName).replace('{1}',UIServices.addCommas(Math.floor(data.winner.maxMoney)))+"</h2><br/>";
		$.each(data.winner.scoreList, function(index, value) {
			html += "<br/>- " + value.playerName + G.i18n.gameEnded_list + UIServices.addCommas(Math.floor(value.money));
		});
		$('#winner').html(html);
		$('#bottom').hide();
		$('#winner').show();
		this.hideWaitOverlay();
	};
	this.waitAddPlayer_resp = function (data) {
		console.log(Math.random());
		console.log(data);
		if(typeof(data.clear) !== 'undefined' && data.clear === true) {
			$('#playerList').html("");
		}
		$.each(data.playerName, function(ind, val) {
			console.log("  --adding:"+val);
			$('#playerList').html($('#playerList').html()+'- '+val+'<br/>');
		});
		if(typeof(data.showStartButton) !== 'undefined') {
			$('#startButtonDiv').show();
		}
	};
	this.sendPlayerData = function (data) {
		G.playerId = data.playerId;
		G.playerNo = data.playerNo;		
		Cookie.set("playerId", data.playerId);
		Cookie.set("gameId", data.gameId);
		G.availableActions = data.availableActions;
	};
	this.uiElement = function (data) {
		/*data = { "x:y" => Field}*/
		G.fieldPane.processReceived(data);
	};
	this.infoBar = function(data) {		
		G.gameState = data.gameState;
		G.infoBar.playerNumber = data.playerNumber;
		G.infoBar.currentDate = data.currentDate;
		G.infoBar.money = data.money;
		G.draw();    
	};
	this.card = function (data) {
		console.log("Got card : #" + data.cards.length);
		for(var i = 0 ; i < data.cards.length ; i++) {
			var card = data.cards[i];		
			var newCard = new Card(card.id, card.title, card.text, card.actionBit, card.playType, card.profitConfig, card.range, card.localLevelMod, card.type, G.ctx);	
			G.cardLayouter.cards.push(newCard);	
		}
	};
	this.onTurnDone = function() {
		this.showWaitOverlay();
		G.turnDoneButton.enabled = false;		
		if(G.gameState == 1) {
			socket.emit('roundEnd_req', { playerId : G.playerId});
			G.cardLayouter.unlock();
			G.cardLayouter.colapse();
		} else if(G.gameState == 2) {
			var bid = parseInt($('#bid').val());
			if(isNaN(bid) || bid <0 ) {
				this.hideWaitOverlay();
				G.turnDoneButton.enabled = true;
				alert(G.i18n.error_illegal_value);
			} else if (bid <= G.infoBar.money || confirm(G.i18n.error_not_enough_money)) {
				socket.emit('auctionBid_req', { playerId : G.playerId, bid: bid });
			} else {
				this.hideWaitOverlay();
				G.turnDoneButton.enabled = true;											
			}
		} else if(G.gameState == 3 || G.gameState == 4) {
			var selectedCardId = G.auctionPanel.currentlyClicked !== null ? G.auctionPanel.currentlyClicked.id : null;
			if(selectedCardId!==null || confirm(G.i18n.error_no_card_selected)) {
				socket.emit('postAuctionSelect_req', { playerId : G.playerId, cardId: selectedCardId });
			} else {
				this.hideWaitOverlay();
				G.turnDoneButton.enabled = true;							
			}
		}
	};
	this.auctionCardRemove = function(msg) {
		G.auctionPanel.removeCard(msg.card);
		G.draw();
	}
	this.startAuction_resp = function(msg) {
		this.hideWaitOverlay();

		msg.incomeReceipt.sort(function(a,b) {
			return b[1]-a[1];
		});

		/*  */		
		G.gameState = msg.gameState;
		this.infoBar(msg.infoBar);
		this.uiElement(msg.uiElement);
		G.availableActions = msg.availableActions;
		G.auctionPanel.selectable = false;
		G.auctionPanel.setCards(msg.cardsToAuction);
		G.canvasManagerAuction.enabled = true;
		G.canvasManagerAuction.currentlyClicked = null;
		G.canvasManagerField.enabled = false;
		G.turnDoneButton.label = G.i18n.button_set_bidding;
		G.turnDoneButton.enabled = true;
		G.incomeReceipt = msg.incomeReceipt;
		G.infoBar.showLargeInfo = false;
		$('#bidInput').show();
		G.draw();		
		changeHelp(6);
	};
	this.showFieldPane = function(msg) {
		this.hideWaitOverlay();
		G.gameState = msg.gameState;
		G.turnDoneButton.label = G.i18n.button_endRound;
		G.turnDoneButton.enabled = true;
		G.canvasManagerAuction.enabled = false;
		G.canvasManagerField.enabled = true;

		if(G.cardLayouter.cards.length > 0) {
			G.cardLayouter.draw(G.ctx); // this calculates the x pos for the new card which is needed for the button's pos in toggle()
			var lastCard = G.cardLayouter.cards[G.cardLayouter.cards.length-1];
			G.cardLayouter.toggle(lastCard);
		}

		if(typeof(msg.lastBids) !== 'undefined') {
			msg.lastBids.sort(function(a,b) {
				return b.cost-a.cost;
			});			
			G.lastBids = msg.lastBids;
		}

		G.draw();
		changeHelp(5);
	};
	this.postAuctionSelection = function(msg) {
		this.hideWaitOverlay();
		$('#bidInput').hide();
		G.auctionPanel.currentlyClicked = null;
		G.gameState = msg.gameState;
		G.infoBar.money = msg.money;
		G.auctionPanel.selectable = true;
		G.turnDoneButton.label = G.i18n.button_pick_card;
		G.turnDoneButton.enabled = true;
		G.draw();	
		changeHelp(7);
	};
	this.initialCardSelection = function(msg) {
		console.log(msg);
		$('#waitingForPlayers').hide();
		$('#bottom').show();
		this.hideWaitOverlay();
		/*  */
		this.infoBar(msg.infoBar);
		G.auctionPanel.selectable = true;
		G.auctionPanel.setCards(msg.cardsToSelect);
		G.canvasManagerAuction.enabled = true;
		G.canvasManagerAuction.currentlyClicked = null;
		G.canvasManagerField.enabled = false;
		G.turnDoneButton.label = G.i18n.button_pick_card;
		G.turnDoneButton.enabled = true;
		G.draw();
		changeHelp(4);
	};
	this.onCardPlay = function(card) {
		this.showWaitOverlay();		
		var msgName = card.playType == 0 ? 'directCardPlay_req' : 'prePlayCard_req';
		socket.emit(msgName, {card : card, playerId : G.playerId });
	};
	this.prePlayCard_resp = function(msg) {
		this.hideWaitOverlay();		
		/* msg = {selectable,range,buildspace} */
		G.fieldPane.surroundingMatrix = FieldPane.createSurroundingRange(msg.range);
		G.fieldPane.selectableType = msg.selectable;
		G.fieldPane.setSelectTargetEnabled(true);
	};
	this.playCardSelectTarget = function(field) {
		this.showWaitOverlay();
		socket.emit('cardPlaySelectTarget_req', { playerId : G.playerId , cardIdToPlay: G.cardLayouter.currentlyClicked.id, targetFieldId: field.cor()});
	};
	this.cardPlaySelectTarget_resp = function(msg) {
		// update card	
		if(typeof msg.cardId !== 'undefined') {
			this.hideWaitOverlay();
			G.cardLayouter.cards.removeById(msg.cardId);
			G.cardLayouter.unlock();
		}
		// update field
		if(typeof msg.field !== 'undefined') {
			//var fields = {};
			//fields[UIElement.cor(msg.field)] = msg.field;
			G.fieldPane.processReceived(msg.field);
		}
		// update availableActions		
		if(typeof msg.availableActions !== 'undefined') {			
			G.availableActions = msg.availableActions;
		}	
		G.draw();
	}
	this.cardPlaySelectTargetFailed_resp = function(msg) {
		this.hideWaitOverlay();
		//G.cardLayouter.unlock();
		G.fieldPane.setSelectTargetEnabled(true);
		alert(G.i18n[msg.error]);
	}
	this.showWait = function(msg) {
		this.showWaitOverlay();
		G.turnDoneButton.enabled = false;		
		G.cardLayouter.unlock();
		G.cardLayouter.colapse();
	}
	this.onCardDiscard = function(card) {
		socket.emit('cardDiscard_req', {card : card, playerId : G.playerId });
	};
}