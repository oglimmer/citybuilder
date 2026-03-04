import { describe, it, expect } from 'vitest';
import Game from '../server/rule_game.js';

describe('Game Remove Card From Auction', () => {

	it('itemsSimpleTest', () => {
		const g = new Game();
		g.gameState = 4;
		g.cardsToAuction = [
			{
				playerId: '8e8593b8145d597e5507585ba813c9b8',
				cardsToSelect: [
					{ clazz: 'Card', id: 55, no: 300, title: 'c300_1', text: 'c300_2', actionBit: 1, playType: 1, range: 2, type: 4 },
					{ clazz: 'Card', id: 29, no: 102, title: 'c102_1', text: 'c102_2', actionBit: 1, playType: 1, range: 1, type: 2 },
					{ clazz: 'Card', id: 107, no: 104, title: 'c104_1', text: 'c104_2', actionBit: 1, playType: 1, range: 3, type: 2 },
					{ clazz: 'Card', id: 190, no: 204, title: 'c204_1', text: 'c204_2', actionBit: 1, playType: 1, range: 1, type: 3 }
				]
			},
			{
				playerId: '8e8593b8145d597e5507585ba813d843',
				cardsToSelect: [
					{ clazz: 'Card', id: 307, no: 100, title: 'c100_1', text: 'c100_2', actionBit: 1, playType: 1, range: 3, type: 2 },
					{ clazz: 'Card', id: 335, no: 207, title: 'c207_1', text: 'c207_2', actionBit: 1, playType: 1, range: 2, type: 3 },
					{ clazz: 'Card', id: 276, no: 400, title: 'c400_1', text: 'c400_2', actionBit: 1, playType: 1, range: 1, type: 5 },
					{ clazz: 'Card', id: 40, no: 200, title: 'c200_1', text: 'c200_2', actionBit: 1, playType: 1, range: 2, type: 3 }
				]
			}
		];
		let c = g.removeCardFromAuction("190", '8e8593b8145d597e5507585ba813c9b8');
		expect(c.title).toBe("c204_1");
		c = g.removeCardFromAuction("276", '8e8593b8145d597e5507585ba813d843');
		expect(c.title).toBe("c400_1");
	});
});
