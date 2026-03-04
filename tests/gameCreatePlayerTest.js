import { describe, it, expect, beforeEach } from 'vitest';
import Game from '../server/rule_game.js';
import PlayerManager from '../server/rule_playermanager.js';
import GameManager from '../server/rule_gamemanager.js';

describe('Game Create Player', () => {

	beforeEach(() => {
		PlayerManager.storePlayer = async (player, prepare) => {
			if (prepare != null) {
				prepare(player);
			}
			player._id = `fakeId${player.playerName}`;
			player._rev = `fakeRev${player.playerName}`;
			return player;
		};

		GameManager.storeGame = async (game, prepare) => {
			if (prepare != null) {
				prepare(game);
			}
			game._id = "fakeId";
			game._rev = "fakeRev";
			return game;
		};
	});

	it('createPlayer', async () => {
		const g = new Game();
		const player1 = await g.createPlayer("socket0", "fooName");
		expect(player1.no).toBe(0);
		expect(player1.playerName).toBe('fooName');
		expect(player1.socketId).toBe('socket0');
		expect(g.maxPlayerNumber).toBe(1);
		expect(g.playerIds).toEqual({ "0": "fakeIdfooName" });
		expect(g.playerNames).toEqual(['fooName']);
		expect(g.playersOnTurn).toEqual(['fakeIdfooName']);

		const player2 = await g.createPlayer("socket1", "barName");
		expect(player2.no).toBe(1);
		expect(player2.playerName).toBe('barName');
		expect(player2.socketId).toBe('socket1');
		expect(g.maxPlayerNumber).toBe(2);
		expect(g.playerIds).toEqual({ "0": "fakeIdfooName", "1": "fakeIdbarName" });
		expect(g.playerNames).toEqual(['fooName', 'barName']);
		expect(g.playersOnTurn).toEqual(['fakeIdfooName', 'fakeIdbarName']);
	});
});
