import { describe, it, expect, beforeEach } from 'vitest';
import Game from '../server/rule_game.js';
import PlayerManager, { PlayerCollection } from '../server/rule_playermanager.js';

const players = [
	{ "_id": "A", "socketId": "foo1", "playerName": "Mr. White", "money": 150 },
	{ "_id": "B", "socketId": "foo2", "playerName": "Mr. Black", "money": 100 },
	{ "_id": "C", "socketId": "foo3", "playerName": "Mr. Green", "money": 50 }
];

function getAllPlayers(count) {
	const arr = new PlayerCollection();
	for (let j = 0; j < count; j++) {
		arr.push({ ...players[j] });
	}
	return arr;
}

describe('Game Bidding', () => {

	beforeEach(() => {
		PlayerManager.storePlayer = async (player, prepare) => {
			if (prepare != null) prepare(player);
			return player;
		};
	});

	it('bids1Simple', async () => {
		const g = new Game();
		g.biddings = { 'A': { originalBid: 5, acutalCost: 0 } };
		g.doNextAuctionPickCard = async () => {};
		const allPlayers = getAllPlayers(1);
		const moneyPlayerA = allPlayers.getPlayerById('A').money;
		await g.processAuctionBid(allPlayers);
		expect(g.auctionTakeOrder).toEqual([['A']]);
		expect(allPlayers.getPlayerById('A').money).toBe(moneyPlayerA - 5);
		expect(g.biddings['A'].acutalCost).toBe(5);
	});

	it('bids2Simple', async () => {
		const g = new Game();
		g.biddings = { 'A': { originalBid: 2, acutalCost: 0 }, 'B': { originalBid: 1, acutalCost: 0 } };
		g.doNextAuctionPickCard = async () => {};
		const allPlayers = getAllPlayers(2);
		const moneyPlayerA = allPlayers.getPlayerById('A').money;
		const moneyPlayerB = allPlayers.getPlayerById('B').money;
		await g.processAuctionBid(allPlayers);
		expect(g.auctionTakeOrder).toEqual([['A'], ['B']]);
		expect(allPlayers.getPlayerById('A').money).toBe(moneyPlayerA - 2);
		expect(allPlayers.getPlayerById('B').money).toBe(moneyPlayerB);
		expect(g.biddings['A'].acutalCost).toBe(2);
		expect(g.biddings['B'].acutalCost).toBe(0);
	});

	it('bids3Simple', async () => {
		const g = new Game();
		g.biddings = { 'A': { originalBid: 10, acutalCost: 0 }, 'B': { originalBid: 5, acutalCost: 0 }, 'C': { originalBid: 20, acutalCost: 0 } };
		g.doNextAuctionPickCard = async () => {};
		const allPlayers = getAllPlayers(3);
		const moneyPlayerA = allPlayers.getPlayerById('A').money;
		const moneyPlayerB = allPlayers.getPlayerById('B').money;
		const moneyPlayerC = allPlayers.getPlayerById('C').money;
		await g.processAuctionBid(allPlayers);
		expect(g.auctionTakeOrder).toEqual([['C'], ['A'], ['B']]);
		expect(allPlayers.getPlayerById('A').money).toBe(moneyPlayerA - 5);
		expect(allPlayers.getPlayerById('B').money).toBe(moneyPlayerB);
		expect(allPlayers.getPlayerById('C').money).toBe(moneyPlayerC - 20);
		expect(g.biddings['A'].acutalCost).toBe(5);
		expect(g.biddings['B'].acutalCost).toBe(0);
		expect(g.biddings['C'].acutalCost).toBe(20);
	});

	it('bids2Equal', async () => {
		const g = new Game();
		g.biddings = { 'A': { originalBid: 2, acutalCost: 0 }, 'B': { originalBid: 2, acutalCost: 0 } };
		g.doNextAuctionPickCard = async () => {};
		const allPlayers = getAllPlayers(2);
		const moneyPlayerA = allPlayers.getPlayerById('A').money;
		const moneyPlayerB = allPlayers.getPlayerById('B').money;
		await g.processAuctionBid(allPlayers);
		expect(g.auctionTakeOrder).toEqual([['A', 'B']]);
		expect(allPlayers.getPlayerById('A').money).toBe(moneyPlayerA - 2);
		expect(allPlayers.getPlayerById('B').money).toBe(moneyPlayerB - 2);
		expect(g.biddings['A'].acutalCost).toBe(2);
		expect(g.biddings['B'].acutalCost).toBe(2);
	});

	it('bids3Equal', async () => {
		const g = new Game();
		g.biddings = { 'A': { originalBid: 2, acutalCost: 0 }, 'B': { originalBid: 2, acutalCost: 0 }, 'C': { originalBid: 2, acutalCost: 0 } };
		g.doNextAuctionPickCard = async () => {};
		const allPlayers = getAllPlayers(3);
		const moneyPlayerA = allPlayers.getPlayerById('A').money;
		const moneyPlayerB = allPlayers.getPlayerById('B').money;
		const moneyPlayerC = allPlayers.getPlayerById('C').money;
		await g.processAuctionBid(allPlayers);
		expect(g.auctionTakeOrder).toEqual([['A', 'B', 'C']]);
		expect(allPlayers.getPlayerById('A').money).toBe(moneyPlayerA - 2);
		expect(allPlayers.getPlayerById('B').money).toBe(moneyPlayerB - 2);
		expect(allPlayers.getPlayerById('C').money).toBe(moneyPlayerC - 2);
		expect(g.biddings['A'].acutalCost).toBe(2);
		expect(g.biddings['B'].acutalCost).toBe(2);
		expect(g.biddings['C'].acutalCost).toBe(2);
	});

	it('bids2', async () => {
		const g = new Game();
		g.biddings = { 'A': { originalBid: 10, acutalCost: 0 }, 'B': { originalBid: 5, acutalCost: 0 } };
		g.doNextAuctionPickCard = async () => {};
		const allPlayers = getAllPlayers(2);
		const moneyPlayerA = allPlayers.getPlayerById('A').money;
		const moneyPlayerB = allPlayers.getPlayerById('B').money;
		await g.processAuctionBid(allPlayers);
		expect(g.auctionTakeOrder).toEqual([['A'], ['B']]);
		expect(allPlayers.getPlayerById('A').money).toBe(moneyPlayerA - 10);
		expect(allPlayers.getPlayerById('B').money).toBe(moneyPlayerB);
		expect(g.biddings['A'].acutalCost).toBe(10);
		expect(g.biddings['B'].acutalCost).toBe(0);
	});

	it('bids1Missing1', async () => {
		const g = new Game();
		g.biddings = { 'A': { originalBid: 10, acutalCost: 0 } };
		g.doNextAuctionPickCard = async () => {};
		const allPlayers = getAllPlayers(2);
		const moneyPlayerA = allPlayers.getPlayerById('A').money;
		const moneyPlayerB = allPlayers.getPlayerById('B').money;
		await g.processAuctionBid(allPlayers);
		expect(g.auctionTakeOrder).toEqual([['A'], ['B']]);
		expect(allPlayers.getPlayerById('A').money).toBe(moneyPlayerA - 10);
		expect(allPlayers.getPlayerById('B').money).toBe(moneyPlayerB);
		expect(g.biddings['A'].acutalCost).toBe(10);
		expect(g.biddings['B'].acutalCost).toBe(0);
	});
});
