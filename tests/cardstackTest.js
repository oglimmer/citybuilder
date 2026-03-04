import { describe, it, expect } from 'vitest';
import CardFactory from '../server/rule_cardfactory.js';
import CardStack from '../server/rule_cardstack.js';

describe('CardStack', () => {

	it('create', () => {
		const cs = new CardStack();
		cs.create(0, 1);
	});

	it('removeTop', () => {
		const cs = new CardStack();
		cs.create(0, 1);
		const l1 = cs.length();
		const c = cs.removeTop();
		const l2 = cs.length();
		expect(l1).toBe(l2 + 1);
		expect(c).not.toBeNull();
		expect(c.clazz).toBe('Card');
	});

	it('addTop', () => {
		const cs = new CardStack();
		cs.create(0, 1);
		const l1 = cs.length();
		const c1 = "foo";
		cs.addTop(c1);
		const l2 = cs.length();
		const c2 = cs.removeTop();
		expect(c1).toBe(c2);
		expect(l1).toBe(l2 - 1);
	});

	it('removeCardById', () => {
		const cs = new CardStack();
		cs.create(0, 1);
		const l1 = cs.length();
		cs.removeCardById(0);
		const l2 = cs.length();
		expect(l1).toBe(l2 + 1);
	});

	it('getById', () => {
		const cs = new CardStack();
		cs.create(0, 1);
		const l1 = cs.length();
		const c = cs.getById(0);
		const l2 = cs.length();
		expect(l1).toBe(l2);
		expect(c).not.toBeNull();
		expect(c.clazz).toBe('Card');
	});

	it('reinit', async () => {
		const cardStack = {
			cards: []
		};
		await CardStack.reinit(cardStack);
		const l1 = cardStack.length();
		const c1 = "foo";
		cardStack.addTop(c1);
		const l2 = cardStack.length();
		const c2 = cardStack.removeTop();
		expect(c1).toBe(c2);
		expect(l1).toBe(l2 - 1);
	});
});
