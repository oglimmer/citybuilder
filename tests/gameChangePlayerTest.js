import { describe, it, expect, beforeEach } from 'vitest';
import Game from '../server/rule_game.js';
import { GameStates } from '../server/rule_defines.js';
import Player from '../server/rule_player.js';
import PlayerManager, { PlayerCollection } from '../server/rule_playermanager.js';
import GameManager from '../server/rule_gamemanager.js';

describe('Game Change Player', () => {
	let game;
	let currentPlayer;

	beforeEach(() => {
		game = new Game();
		game._id = 'gameFakeId';

		PlayerManager.storePlayer = async (player, prepare) => {
			if (prepare != null) {
				prepare(player);
			}
			if (player._id == null || typeof player._id === 'undefined') {
				player._id = 'fakeId';
			}
			return player;
		};

		PlayerManager.getPlayerBySocketId = async (socketId) => {
			return currentPlayer;
		};

		PlayerManager.getPlayers = async (gameId) => {
			const arr = new PlayerCollection();
			if (currentPlayer) arr.push(currentPlayer);
			return arr;
		};

		GameManager.getGame = async (gameId) => {
			return game;
		};

		GameManager.storeGame = async (g, prepare) => {
			if (prepare != null) {
				prepare(g);
			}
			return g;
		};

		GameManager.deleteGame = async () => {};
	});

	it('changePlayer', async () => {
		const createdPlayer = await game.createPlayer("socket", "player");
		currentPlayer = createdPlayer;

		expect(game.playerIds).toEqual({ "0": "fakeId" });
		expect(game.playerNames).toEqual(['player']);
		expect(game.playersOnTurn).toEqual(['fakeId']);
		expect(createdPlayer.socketId).not.toBeNull();

		// Change game state so removePlayer doesn't delete the game
		game.gameState = GameStates.CITY_VIEW;

		const result = await Game.removePlayer("socket");

		expect(result.type).toBe('playerRemoved');
		expect(createdPlayer.socketId).toBeNull();

		const joinedPlayer = await game.rejoinPlayer("socket", currentPlayer);

		expect(joinedPlayer.socketId).not.toBeNull();
	});
});
