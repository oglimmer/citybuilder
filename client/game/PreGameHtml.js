import { G, socket } from './state.js';
import Cookie from './Cookie.js';

export function changeHelp(helpId) {
	document.getElementById('help').innerHTML = G.i18n[`help_${helpId}`];
}

export function validateInput(playerName) {
	if (playerName == '') {
		alert(G.i18n.error_noname);
		return false;
	}
	return true;
}

export function createGame() {
	const playerName = document.getElementById('playerName').value;
	if (validateInput(playerName)) {
		document.getElementById('top').style.display = 'none';
		document.getElementById('waitingForPlayers').style.display = 'block';
		G.serverCommListener.init();
		socket.emit('createGame_req', { playerName: playerName });
		changeHelp(1);
	}
}

export function listGames() {
	G.serverCommListener.init();
	socket.on('listGames_resp', listGames_resp);
	socket.emit('listGames_req');
}

function listGames_resp(data) {
	if (data.length > 0) {
		const div = document.getElementById('availGamesDiv');
		div.innerHTML = `<br/>${G.i18n.msg_games_available}:<br/>`;
		const s = document.createElement('select');
		s.id = 'availGamesSel';
		data.forEach((value) => {
			const opt = document.createElement('option');
			opt.value = value.gameId;
			opt.textContent = `With ${value.players.length === 0 ? G.i18n.msg_nobody_at_the_moment : value.players}`;
			s.appendChild(opt);
		});
		div.appendChild(s);
		div.appendChild(document.createElement('br'));
		const joinBtn = document.createElement('input');
		joinBtn.type = 'button';
		joinBtn.value = G.i18n.msg_join_selected_game;
		joinBtn.addEventListener('click', joinGame);
		div.appendChild(joinBtn);
	}
	changeHelp(2);
}

export function joinGame() {
	const playerName = document.getElementById('playerName').value;
	if (validateInput(playerName)) {
		document.getElementById('top').style.display = 'none';
		document.getElementById('waitingForPlayers').style.display = 'block';
		const gameId = document.getElementById('availGamesSel').value;
		socket.emit('joinGame_req', { gameId: gameId, playerName: playerName });
		changeHelp(3);
	}
}

export function rejoinGame() {
	document.getElementById('top').style.display = 'none';
	document.getElementById('bottom').style.display = 'block';
	const gameId = Cookie.get('gameId');
	const playerId = Cookie.get('playerId');
	socket.emit('reJoinGame_req', { gameId: gameId, playerId: playerId });
}

export function startGame() {
	socket.emit('startGame', { playTime: document.getElementById('playTime').value });
}
