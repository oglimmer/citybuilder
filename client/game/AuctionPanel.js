import { G, THEME } from './state.js';
import { AuctionCard } from './Card.js';

export default class AuctionPanel {
	constructor() {
		this.cards = [];
		this.currentlyClicked = null;
		this.selectable = false;
	}

	setCards(cards) {
		let x = 10;
		const y = 50;
		this.cards = [];
		for (let i = 0; i < cards.length; i++) {
			const c = cards[i];
			const card = new AuctionCard(c.id, c.title, c.text, x, y, c.profitConfig, c.range, c.localLevelMod, c.type, G.ctx);
			this.cards.push(card);
			x += card.width + 8;
		}
	}

	removeCard(cardToRemove) {
		for (let i = 0; i < this.cards.length; i++) {
			const card = this.cards[i];
			if (card.id === cardToRemove.id) {
				card.removed = true;
				if (card.clicked) {
					card.clicked = false;
					this.currentlyClicked = null;
				}
			}
		}
	}

	draw(ctx) {
		this.width = ctx.canvas.width - 4;
		this.height = ctx.canvas.height - 24;
		ctx.beginPath();
		ctx.font = `bold 13px ${THEME.fontFamily}`;
		ctx.fillStyle = THEME.auctionText;
		if (G.gameState == 2) {
			ctx.fillText(G.i18n.auctionPanel_title1, 10, 38);
		} else {
			ctx.fillText(G.i18n.auctionPanel_title2, 10, 38);
		}
		ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;
		for (let i = 0; i < this.cards.length; i++) {
			const card = this.cards[i];
			card.draw(ctx);
		}

		if (G.gameState == 2) {
			ctx.fillStyle = THEME.auctionText;
			ctx.fillText(`${G.i18n.auctionPanel_enter_bid} $`, ctx.canvas.width - ctx.measureText(`${G.i18n.auctionPanel_enter_bid} $`).width - 140, ctx.canvas.height - 17);
		}
	}

	onclick(x, y) {
		if (this.selectable) {
			for (let i = 0; i < this.cards.length; i++) {
				const card = this.cards[i];
				if (!card.removed && card.onclick(x, y)) {
					if (this.currentlyClicked !== null && this.currentlyClicked !== card) {
						this.currentlyClicked.clicked = false;
					}
					this.currentlyClicked = card;
					if (this.currentlyClicked.clicked) {
						this.currentlyClicked.clicked = false;
						this.currentlyClicked = null;
					} else {
						this.currentlyClicked.clicked = true;
					}
				}
			}
		}
		return false;
	}

	atPos(x, y) {
	}
}
