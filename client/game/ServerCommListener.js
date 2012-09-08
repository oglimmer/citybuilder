/* ------------------------------------------ */
/* class ServerCommListener */
/* ------------------------------------------ */
function ServerCommListener() {	
	var self = this;
	/*socket is a global variable*/
	this.init = function() {
		socket.on('startGame_resp', self.startGame_resp);
		socket.on('uiElement', self.uiElement);	
		socket.on('infoBar', self.infoBar);	
		socket.on('card', self.card);	
		socket.on('prePlayCard_resp', self.prePlayCard_resp);	
		socket.on('cardPlaySelectTarget_resp', self.cardPlaySelectTarget_resp);
		socket.on('onStartAuction_resp', self.onStartAuction_resp);
		socket.on('waitAddPlayer', self.waitAddPlayer);
		socket.on('gamedEnded', self.gamedEnded);
		socket.on('requestAllPlayerData_resp', self.requestAllPlayerData_resp);
		socket.on('postAuctionSelection', self.postAuctionSelection);
		socket.on('auctionComplete', self.auctionComplete);
		socket.on('auctionCardRemove', self.auctionCardRemove);
	};	
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
		$('#overlay').hide();
	};
	this.waitAddPlayer = function (data) {
		$.each(data.playerName, function(ind, val) {
			$('#playerList').html($('#playerList').html()+'- '+val+'<br/>');
		});
		if(typeof(data.showStartButton) !== 'undefined') {
			$('#startButtonDiv').show();
		}
	};
	this.startGame_resp = function (data) {
		$('#waitingForPlayers').hide();
		$('#bottom').show();
		G.playerId = data.playerId;
		G.playerNo = data.playerNo;		
		Cookie.set("playerId", data.playerId, 7);
		Cookie.set("gameId", data.gameId, 7);
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
			G.cardLayouter.cards.push(new Card(card.id, card.title, card.text, card.actionBit,card.playType, G.ctx));	
		}
	};
	this.onTurnDone = function() {
		$('#overlay').show();
		G.turnDoneButton.enabled = false;		
		if(G.gameState == 1) {
			socket.emit('roundEnd_req', { playerId : G.playerId});
			G.cardLayouter.unlock();
			G.cardLayouter.colapse();
		} else if(G.gameState == 2) {
			var bid = parseInt($('#bid').val());
			if(isNaN(bid) || bid <0 || bid > G.infoBar.money) {
				$('#overlay').hide();
				G.turnDoneButton.enabled = true;
				alert(G.i18n.error_not_enough_money);
			} else {
				socket.emit('auctionBid_req', { playerId : G.playerId, bid: bid });
			}
		} else if(G.gameState == 3) {
			var selectedCardId = G.auctionPanel.currentlyClicked !== null ? G.auctionPanel.currentlyClicked.id : null;
			socket.emit('postAuctionSelect_req', { playerId : G.playerId, cardId: selectedCardId });
		}
	};
	this.auctionCardRemove = function(msg) {
		G.auctionPanel.removeCard(msg.card);
		G.draw();
	}
	this.onStartAuction_resp = function(msg) {
		$('#overlay').hide();
		/*  */
		G.gameState = msg.gameState;
		self.infoBar(msg.infoBar);
		self.uiElement(msg.uiElement);
		G.availableActions = msg.availableActions;
		G.auctionPanel.selectable = false;
		G.auctionPanel.setCards(msg.cardsToAuction);
		G.canvasManagerAuction.enabled = true;
		G.canvasManagerAuction.currentlyClicked = null;
		G.canvasManagerField.enabled = false;
		G.turnDoneButton.label = G.i18n.button_set_bidding;
		G.turnDoneButton.enabled = true;
		$('#bidInput').show();
		G.draw();
	};
	this.auctionComplete = function(msg) {
		$('#overlay').hide();
		G.gameState = msg.gameState;
		G.turnDoneButton.label = G.i18n.button_endRound;
		G.turnDoneButton.enabled = true;
		G.canvasManagerAuction.enabled = false;
		G.canvasManagerField.enabled = true;
		G.draw();
	};
	this.postAuctionSelection = function(msg) {
		$('#overlay').hide();
		$('#bidInput').hide();
		G.gameState = msg.gameState;
		G.infoBar.money = msg.money;
		G.auctionPanel.selectable = true;
		G.turnDoneButton.label = G.i18n.button_pick_card;
		G.turnDoneButton.enabled = true;
		G.draw();	
	}
	this.onCardPlay = function(card) {
		$('#overlay').show();		
		var msgName = card.playType == 0 ? 'directCardPlay_req' : 'prePlayCard_req';
		socket.emit(msgName, {card : card, playerId : G.playerId });
	};
	this.prePlayCard_resp = function(msg) {
		$('#overlay').hide();		
		/* msg = {selectable,range,buildspace} */
		G.fieldPane.surroundingMatrix = FieldPane.createSurroundingRange(msg.range);
		G.fieldPane.selectableType = msg.selectable;
		G.fieldPane.setSelectTargetEnabled(true);
	};
	this.playCardSelectTarget = function(field) {
		$('#overlay').show();
		socket.emit('cardPlaySelectTarget_req', { playerId : G.playerId , cardIdToPlay: G.cardLayouter.currentlyClicked.id, targetFieldId: field.cor()});
	};
	this.cardPlaySelectTarget_resp = function(msg) {
		// update card	
		if(typeof msg.cardId !== 'undefined') {
			$('#overlay').hide();
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
	this.onCardDiscard = function(card) {
		socket.emit('cardDiscard_req', {card : card, playerId : G.playerId });
	};
}