import { describe, it, expect } from 'vitest';
import { RentalCard } from '../server/rule_card.js';

describe('RentalCard Profit', () => {

	it('twoTypesHit', () => {
		const rc = new RentalCard(1, 1, 1, 1, [{ ht: [1, 10], pro: 5 }], 0);
		const profit = rc.getProfit({ attachedCard: { houseType: 5 } });
		expect(profit).toBe(5);
	});

	it('oneTypeHit', () => {
		const rc = new RentalCard(1, 1, 1, 1, [{ ht: [2], pro: 5 }], 0);
		const profit = rc.getProfit({ attachedCard: { houseType: 2 } });
		expect(profit).toBe(5);
	});

	it('oneTypeNoHit', () => {
		const rc = new RentalCard(1, 1, 1, 1, [{ ht: [2], pro: 5 }], 0);
		const profit = rc.getProfit({ attachedCard: { houseType: 4 } });
		expect(profit).toBe(0);
	});

	it('twoTypesNoHit', () => {
		const rc = new RentalCard(1, 1, 1, 1, [{ ht: [1, 9], pro: 5 }], 0);
		const profit = rc.getProfit({ attachedCard: { houseType: 10 } });
		expect(profit).toBe(0);
	});

	it('twoTypesTwoElementsHit', () => {
		const rc = new RentalCard(1, 1, 1, 1, [{ ht: [1, 5], pro: 15 }, { ht: [6, 10], pro: 5 }], 0);
		expect(rc.getProfit({ attachedCard: { houseType: 1 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 2 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 3 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 4 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 5 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 6 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 7 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 8 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 9 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 10 } })).toBe(5);
	});

	it('twoTypesTwoElements', () => {
		const rc = new RentalCard(1, 1, 1, 1, [{ ht: [2, 5], pro: 15 }, { ht: [6, 9], pro: 5 }], 0);
		expect(rc.getProfit({ attachedCard: { houseType: 1 } })).toBe(0);
		expect(rc.getProfit({ attachedCard: { houseType: 2 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 3 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 4 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 5 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 6 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 7 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 8 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 9 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 10 } })).toBe(0);
	});

	it('twoTypesThreeElements', () => {
		const rc = new RentalCard(1, 1, 1, 1, [{ ht: [2, 3], pro: 115 }, { ht: [4, 6], pro: 15 }, { ht: [7, 9], pro: 3 }], 0);
		expect(rc.getProfit({ attachedCard: { houseType: 1 } })).toBe(0);
		expect(rc.getProfit({ attachedCard: { houseType: 2 } })).toBe(115);
		expect(rc.getProfit({ attachedCard: { houseType: 3 } })).toBe(115);
		expect(rc.getProfit({ attachedCard: { houseType: 4 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 5 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 6 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 7 } })).toBe(3);
		expect(rc.getProfit({ attachedCard: { houseType: 8 } })).toBe(3);
		expect(rc.getProfit({ attachedCard: { houseType: 9 } })).toBe(3);
		expect(rc.getProfit({ attachedCard: { houseType: 10 } })).toBe(0);
	});

	it('maxComplex', () => {
		const rc = new RentalCard(1, 1, 1, 1, [{ ht: [2], pro: 115 }, { ht: [3, 6], pro: 15 }, { ht: [7, 8], pro: 5 }, { ht: [9], pro: 3 }], 0);
		expect(rc.getProfit({ attachedCard: { houseType: 1 } })).toBe(0);
		expect(rc.getProfit({ attachedCard: { houseType: 2 } })).toBe(115);
		expect(rc.getProfit({ attachedCard: { houseType: 3 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 4 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 5 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 6 } })).toBe(15);
		expect(rc.getProfit({ attachedCard: { houseType: 7 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 8 } })).toBe(5);
		expect(rc.getProfit({ attachedCard: { houseType: 9 } })).toBe(3);
		expect(rc.getProfit({ attachedCard: { houseType: 10 } })).toBe(0);
	});
});
