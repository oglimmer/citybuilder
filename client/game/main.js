import { G, socket, setG, setGL } from './state.js';
import Cookie from './Cookie.js';
import Global from './Global.js';
import GlobalListeners from './GlobalListeners.js';
import { createGame, listGames, joinGame, rejoinGame, startGame } from './PreGameHtml.js';

// Expose functions for onclick attributes in HTML
window.createGame = createGame;
window.listGames = listGames;
window.joinGame = joinGame;
window.rejoinGame = rejoinGame;
window.startGame = startGame;

window.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('gameCanvas');
	canvas.width = window.innerWidth - 225;
	canvas.height = window.innerHeight - 35;

	setG(new Global());
	setGL(new GlobalListeners());

	document.querySelectorAll('.translate').forEach((el) => {
		el.textContent = G.i18n[el.textContent];
	});
	document.querySelectorAll('input[type="button"]').forEach((el) => {
		el.value = G.i18n[el.value];
	});

	if (Cookie.get('playerId') !== '' && Cookie.get('gameId') !== '') {
		G.serverCommListener.init();
		socket.on('reJoinGameCheck_resp', () => {
			const btn = document.createElement('input');
			btn.type = 'button';
			btn.value = G.i18n.msg_re_join_game;
			btn.addEventListener('click', rejoinGame);
			document.getElementById('rejoinDiv').appendChild(btn);
		});
		socket.emit('reJoinGameCheck_req', { gameId: Cookie.get('gameId') });
	}
});
