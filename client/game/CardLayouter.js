import { G } from './state.js';

export default class CardLayouter {
	constructor(ctx) {
		this.cards = [];
		this.maxWidth = 600;
		this.currentlyExpanded = null;
		this.currentlyClicked = null;
		this._ctx = ctx;
	}

	draw(ctx) {
		for (let i = 0; i < this.cards.length; i++) {
			const j = i < this.cards.length - 1 && this.cards[i].expanded ? i + 1 : (i > 0 && this.cards[i - 1].expanded ? i - 1 : i);
			const card = this.cards[j];
			card.x = 10 + j * Math.min(this.maxWidth / this.cards.length, card.width + 5);
			card.draw(ctx);
		}
	}

	toggle(card) {
		G.canvasManagerField.clearTemp();
		card.toggle();
		if (this.currentlyExpanded !== null && this.currentlyExpanded !== card) {
			this.currentlyExpanded.toggle();
		}
		this.currentlyExpanded = card.expanded ? card : null;
	}

	onclick(x, y) {
		if (this.currentlyClicked === null) {
			for (let i = this.cards.length - 1; i >= 0; i--) {
				const card = this.cards[i];
				if (card.onclick(x, y)) {
					this.toggle(card);
					return true;
				}
			}
		}
		return false;
	}

	atPos(x, y) {
		if (this.currentlyClicked === null) {
			for (let i = this.cards.length - 1; i >= 0; i--) {
				const card = this.cards[i];
				if (card.atPos(x, y)) {
					return true;
				}
			}
		}
		return false;
	}

	resize() {
		for (const card of this.cards) {
			card.y = this._ctx.canvas.height - card.height;
		}
	}

	isExpanded() {
		return this.currentlyExpanded !== null;
	}

	expand(card) {
		if (this.isExpanded()) {
			this.colapse();
		}
		this.currentlyExpanded = card;
		this.currentlyExpanded.toggle();
	}

	colapse() {
		if (this.isExpanded()) {
			G.canvasManagerField.clearTemp();
			this.currentlyExpanded.toggle();
			this.currentlyExpanded = null;
		}
	}

	isLocked() {
		return this.currentlyClicked !== null;
	}

	lock(card) {
		if (this.isLocked()) {
			this.unlock();
		}
		this.currentlyClicked = card;
		this.currentlyClicked.clicked = true;
	}

	unlock() {
		if (this.isLocked()) {
			this.colapse();
			G.canvasManagerField.clearTemp();
			this.currentlyClicked.clicked = false;
			this.currentlyClicked = null;
			G.fieldPane.setSelectTargetEnabled(false);
		}
	}
}
