import CardFactory from './rule_cardfactory.js';
import { Card } from './cards/card_basecards.js';
import log4js from 'log4js';

const logger = log4js.getLogger('card');

export default class CardStack {
	constructor() {
		this.cards = [];
	}

	shuffle() {
		for (let i = 0; i < this.cards.length; i++) {
			const rand = Math.floor(Math.random() * this.cards.length);
			const tmp = this.cards[i];
			this.cards[i] = this.cards[rand];
			this.cards[rand] = tmp;
		}
	}

	createBlock(stage) {
		let id = -1;
		this.cards.forEach((e) => {
			id = Math.max(e.id, id);
		});
		id++;
		const availCards = CardFactory[`availCards${stage}`];
		for (let i = 0; i < availCards.length; i++) {
			const defEle = availCards[i];
			for (let j = 0; j < (stage == 0 ? 1 : defEle[1]); j++) {
				const card = CardFactory.createCard(id, defEle[0]);
				this.addTop(card);
				id++;
			}
		}
	}

	create(stage, count) {
		let c = 0;
		while (c++ < count) {
			this.createBlock(stage);
		}
		logger.debug(`[CardStack::create] stack created. New size:${this.cards.length}`);
		this.shuffle();
	}

	clear() {
		this.cards = [];
	}

	length() {
		return this.cards.length;
	}

	addTop(c) {
		this.cards.push(c);
	}

	removeTop() {
		return this.cards.pop();
	}

	removeCardById(cardId) {
		if (typeof cardId === "undefined") logger.error("Error in removeCardById - cardId is undefined");
		for (let i = 0; i < this.cards.length; i++) {
			if (this.cards[i].id == cardId) {
				this.cards.splice(i, 1);
				break;
			}
		}
	}

	getById(cardId) {
		if (typeof cardId === "undefined") logger.error("Error in getById - cardId is undefined");
		for (let i = 0; i < this.cards.length; i++) {
			if (this.cards[i].id == cardId) {
				return this.cards[i];
			}
		}
	}

	static async reinit(body) {
		Object.setPrototypeOf(body, CardStack.prototype);
		for (let i = 0; i < body.cards.length; i++) {
			await Card.reinit(body.cards[i]);
		}
	}
}

CardStack.NUMBER_PER_CARD = 5;
