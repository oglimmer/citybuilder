import { io as createSocket } from 'socket.io-client';
import { G, socket, setSocket } from './state.js';
import Cookie from './Cookie.js';
import { Card } from './Card.js';
import FieldPane from './FieldPane.js';
import UIServices from './UIServices.js';
import { changeHelp } from './PreGameHtml.js';

export default class ServerCommListener {
	#time = null;

	showWaitOverlay() {
		document.getElementById('overlay').style.display = 'block';
		this.#time = new Date();
	}

	hideWaitOverlay() {
		document.getElementById('overlay').style.display = 'none';
		console.log(new Date() - this.#time);
	}

	init() {
		if (socket === null) {
			setSocket(createSocket());
			socket.on('sendPlayerData', (data) => this.sendPlayerData(data));
			socket.on('uiElement', (data) => this.uiElement(data));
			socket.on('infoBar', (data) => this.infoBar(data));
			socket.on('card', (data) => this.card(data));
			socket.on('prePlayCard_resp', (data) => this.prePlayCard_resp(data));
			socket.on('cardPlaySelectTarget_resp', (data) => this.cardPlaySelectTarget_resp(data));
			socket.on('cardPlaySelectTargetFailed_resp', (data) => this.cardPlaySelectTargetFailed_resp(data));
			socket.on('startAuction_resp', (data) => this.startAuction_resp(data));
			socket.on('waitAddPlayer_resp', (data) => this.waitAddPlayer_resp(data));
			socket.on('gamedEnded', (data) => this.gamedEnded(data));
			socket.on('requestAllPlayerData_resp', (data) => this.requestAllPlayerData_resp(data));
			socket.on('postAuctionSelection', (data) => this.postAuctionSelection(data));
			socket.on('showFieldPane', (data) => this.showFieldPane(data));
			socket.on('auctionCardRemove', (data) => this.auctionCardRemove(data));
			socket.on('initialCardSelection', (data) => this.initialCardSelection(data));
			socket.on('showWait', (data) => this.showWait(data));
			socket.on('reconnect', () => this.reconnect());
			socket.on('gameCanceled', () => this.gameCanceled());
		}
	}

	reconnect() {
		socket.emit('reJoinGame_req', { reconnect: true, playerId: G.playerId, gameId: Cookie.get('gameId') });
	}

	gameCanceled() {
		document.getElementById('availGamesDiv').innerHTML = '';
		document.getElementById('playerList').innerHTML = '';
		document.getElementById('top').style.display = 'block';
		document.getElementById('waitingForPlayers').style.display = 'none';
		changeHelp(0);
	}

	requestAllPlayerData() {
		socket.emit('requestAllPlayerData_req', { playerId: G.playerId });
	}

	requestAllPlayerData_resp(data) {
		data.sort((a, b) => b.money - a.money);
		G.allPlayersData = data;
		G.draw();
	}

	gamedEnded(data) {
		data.winner.scoreList.sort((a, b) => b.money - a.money);
		let html = `<h2>${G.i18n.gameEnded_winner.replace('{0}', data.winner.playerName).replace('{1}', UIServices.addCommas(Math.floor(data.winner.maxMoney)))}</h2><br/>`;
		data.winner.scoreList.forEach((value) => {
			html += `<br/>- ${value.playerName}${G.i18n.gameEnded_list}${UIServices.addCommas(Math.floor(value.money))}`;
		});
		document.getElementById('winner').innerHTML = html;
		document.getElementById('bottom').style.display = 'none';
		document.getElementById('winner').style.display = 'block';
		this.hideWaitOverlay();
	}

	waitAddPlayer_resp(data) {
		console.log(Math.random());
		console.log(data);
		if (typeof data.clear !== 'undefined' && data.clear === true) {
			document.getElementById('playerList').innerHTML = '';
		}
		data.playerName.forEach((val) => {
			console.log(`  --adding:${val}`);
			const el = document.getElementById('playerList');
			el.innerHTML += `- ${val}<br/>`;
		});
		if (typeof data.showStartButton !== 'undefined') {
			document.getElementById('startButtonDiv').style.display = 'block';
		}
	}

	sendPlayerData(data) {
		G.playerId = data.playerId;
		G.playerNo = data.playerNo;
		Cookie.set('playerId', data.playerId);
		Cookie.set('gameId', data.gameId);
		G.availableActions = data.availableActions;
	}

	uiElement(data) {
		G.fieldPane.processReceived(data);
	}

	infoBar(data) {
		G.gameState = data.gameState;
		G.infoBar.playerNumber = data.playerNumber;
		G.infoBar.currentDate = data.currentDate;
		G.infoBar.money = data.money;
		G.draw();
	}

	card(data) {
		console.log(`Got card : #${data.cards.length}`);
		for (let i = 0; i < data.cards.length; i++) {
			const card = data.cards[i];
			const newCard = new Card(card.id, card.title, card.text, card.actionBit, card.playType, card.profitConfig, card.range, card.localLevelMod, card.type, G.ctx);
			G.cardLayouter.cards.push(newCard);
		}
	}

	onTurnDone() {
		this.showWaitOverlay();
		G.turnDoneButton.enabled = false;
		if (G.gameState == 1) {
			socket.emit('roundEnd_req', { playerId: G.playerId });
			G.cardLayouter.unlock();
			G.cardLayouter.colapse();
		} else if (G.gameState == 2) {
			const bid = parseInt(document.getElementById('bid').value);
			if (isNaN(bid) || bid < 0) {
				this.hideWaitOverlay();
				G.turnDoneButton.enabled = true;
				alert(G.i18n.error_illegal_value);
			} else if (bid <= G.infoBar.money || confirm(G.i18n.error_not_enough_money)) {
				socket.emit('auctionBid_req', { playerId: G.playerId, bid: bid });
			} else {
				this.hideWaitOverlay();
				G.turnDoneButton.enabled = true;
			}
		} else if (G.gameState == 3 || G.gameState == 4) {
			const selectedCardId = G.auctionPanel.currentlyClicked !== null ? G.auctionPanel.currentlyClicked.id : null;
			if (selectedCardId !== null || confirm(G.i18n.error_no_card_selected)) {
				socket.emit('postAuctionSelect_req', { playerId: G.playerId, cardId: selectedCardId });
			} else {
				this.hideWaitOverlay();
				G.turnDoneButton.enabled = true;
			}
		}
	}

	auctionCardRemove(msg) {
		G.auctionPanel.removeCard(msg.card);
		G.draw();
	}

	startAuction_resp(msg) {
		this.hideWaitOverlay();

		msg.incomeReceipt.sort((a, b) => b[1] - a[1]);

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
		document.getElementById('bidInput').style.display = 'block';
		G.draw();
		changeHelp(6);
	}

	showFieldPane(msg) {
		this.hideWaitOverlay();
		G.gameState = msg.gameState;
		G.turnDoneButton.label = G.i18n.button_endRound;
		G.turnDoneButton.enabled = true;
		G.canvasManagerAuction.enabled = false;
		G.canvasManagerField.enabled = true;

		if (G.cardLayouter.cards.length > 0) {
			G.cardLayouter.draw(G.ctx);
			const lastCard = G.cardLayouter.cards[G.cardLayouter.cards.length - 1];
			G.cardLayouter.toggle(lastCard);
		}

		if (typeof msg.lastBids !== 'undefined') {
			msg.lastBids.sort((a, b) => b.cost - a.cost);
			G.lastBids = msg.lastBids;
		}

		G.draw();
		changeHelp(5);
	}

	postAuctionSelection(msg) {
		this.hideWaitOverlay();
		document.getElementById('bidInput').style.display = 'none';
		G.auctionPanel.currentlyClicked = null;
		G.gameState = msg.gameState;
		G.infoBar.money = msg.money;
		G.auctionPanel.selectable = true;
		G.turnDoneButton.label = G.i18n.button_pick_card;
		G.turnDoneButton.enabled = true;
		G.draw();
		changeHelp(7);
	}

	initialCardSelection(msg) {
		console.log(msg);
		document.getElementById('waitingForPlayers').style.display = 'none';
		document.getElementById('bottom').style.display = 'block';
		this.hideWaitOverlay();
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
	}

	onCardPlay(card) {
		this.showWaitOverlay();
		const msgName = card.playType == 0 ? 'directCardPlay_req' : 'prePlayCard_req';
		socket.emit(msgName, { card: card, playerId: G.playerId });
	}

	prePlayCard_resp(msg) {
		this.hideWaitOverlay();
		G.fieldPane.surroundingMatrix = FieldPane.createSurroundingRange(msg.range);
		G.fieldPane.selectableType = msg.selectable;
		G.fieldPane.setSelectTargetEnabled(true);
	}

	playCardSelectTarget(field) {
		this.showWaitOverlay();
		socket.emit('cardPlaySelectTarget_req', { playerId: G.playerId, cardIdToPlay: G.cardLayouter.currentlyClicked.id, targetFieldId: field.cor() });
	}

	cardPlaySelectTarget_resp(msg) {
		if (typeof msg.cardId !== 'undefined') {
			this.hideWaitOverlay();
			const idx = G.cardLayouter.cards.findIndex(c => c.id === msg.cardId);
			if (idx !== -1) G.cardLayouter.cards.splice(idx, 1);
			G.cardLayouter.unlock();
		}
		if (typeof msg.field !== 'undefined') {
			G.fieldPane.processReceived(msg.field);
		}
		if (typeof msg.availableActions !== 'undefined') {
			G.availableActions = msg.availableActions;
		}
		G.draw();
	}

	cardPlaySelectTargetFailed_resp(msg) {
		this.hideWaitOverlay();
		G.fieldPane.setSelectTargetEnabled(true);
		alert(G.i18n[msg.error]);
	}

	showWait(msg) {
		this.showWaitOverlay();
		G.turnDoneButton.enabled = false;
		G.cardLayouter.unlock();
		G.cardLayouter.colapse();
	}

	onCardDiscard(card) {
		socket.emit('cardDiscard_req', { card: card, playerId: G.playerId });
	}
}
