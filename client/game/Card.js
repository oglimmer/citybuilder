import { G, THEME } from './state.js';
import UIServices from './UIServices.js';
import Button from './Button.js';

export class BaseCard {
	drawText(ctx) {
		BaseCard.drawText(ctx, G.i18n[this.text], this.profitConfig, this.x, this.y + 30, this.width);
	}

	static drawText(ctx, text, profitConfig, x, y, width) {
		if (typeof profitConfig !== 'undefined') {
			for (let i = 0; i < profitConfig.length; i++) {
				const pf = profitConfig[i];
				if (text.length > 0) {
					text += ' ^';
				}
				text += `$${pf.pro} pPpW for `;
				if (pf.ht.length == 1) {
					text += UIServices.getHouseTypeText(pf.ht[0]);
				} else {
					if (pf.ht[0] == 1 && pf.ht[1] == 10) {
						text += G.i18n.c_all_housetypes;
					} else {
						for (let j = pf.ht[0]; j <= pf.ht[1]; j++) {
							if (j !== pf.ht[0]) {
								text += ' / ';
							}
							text += UIServices.getHouseTypeText(j);
						}
					}
				}
				text += '.';
			}
		}
		if (text.match(/\{.*\}/)) {
			const originalText = text;
			const pattern = /{[0-9]+,[0-9]+}/g;
			const toReplace = originalText.match(pattern);
			const textToken = originalText.split(pattern);
			let resultText = '';
			let j = 0;
			for (let i = 0; i < textToken.length; i++) {
				resultText += textToken[i];
				if (i < textToken.length - 1) {
					let tempTxt = toReplace[j++];
					tempTxt = tempTxt.substring(1, tempTxt.length - 1);
					const start = parseInt(tempTxt.substring(0, tempTxt.indexOf(',')));
					const end = parseInt(tempTxt.substring(tempTxt.indexOf(',') + 1));
					let tempTxtDisp = '';
					if (start == 1 && end == 10) {
						tempTxtDisp += G.i18n.c_all_housetypes;
					} else {
						for (let k = start; k <= end; k++) {
							if (k !== start) {
								tempTxtDisp += ' / ';
							}
							tempTxtDisp += UIServices.getHouseTypeText(k);
						}
					}
					resultText += tempTxtDisp;
				}
			}
			text = resultText;
		}
		const words = text.split(' ');
		let line = '';

		for (let n = 0; n < words.length; n++) {
			if (words[n].charAt(0) == '^') {
				ctx.fillText(line, x + 8, y);
				y += 18;
				line = '';
				words[n] = words[n].substring(1);
			}
			const testLine = line + words[n] + ' ';
			const metrics = ctx.measureText(testLine);
			const testWidth = metrics.width;
			if (testWidth > width - 8) {
				ctx.fillText(line, x + 8, y);
				line = words[n] + ' ';
				y += 12;
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line, x + 8, y);
	}

	onclick(x, y) {
		return this.atPos(x, y);
	}

	atPos(x, y) {
		return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
	}
}

export class Card extends BaseCard {
	constructor(id, title, text, actionBit, playType, profitConfig, range, localLevelMod, type, ctx) {
		super();
		this.id = id;
		this.title = title;
		this.text = text;
		this.actionBit = actionBit;
		this.playType = playType;
		this.profitConfig = profitConfig;
		this.range = range;
		this.localLevelMod = localLevelMod;
		this.type = type;
		this.x = null;
		this.height = 22;
		this.y = ctx.canvas.height - this.height;
		this.width = 180;
		this.expanded = false;
		this.clicked = false;
		this._ctx = ctx;
	}

	onDiscardClicked() {
		G.serverCommListener.onCardDiscard(this);
		const idx = G.cardLayouter.cards.indexOf(this);
		if (idx !== -1) G.cardLayouter.cards.splice(idx, 1);
		G.cardLayouter.colapse();
		G.draw();
	}

	onCancelClicked() {
		G.cardLayouter.unlock();
		G.draw();
	}

	onPlayClicked() {
		G.serverCommListener.onCardPlay(this);
		G.canvasManagerField.clearTemp();
		G.cardLayouter.lock(this);
		G.canvasManagerField.addTemp(67, new Button(G.i18n.button_cancel, this.x, () => this.y - 28, 70, () => this.onCancelClicked()));
		G.draw();
	}

	toggle() {
		if (this.expanded) {
			this.height = 22;
			this.y = this._ctx.canvas.height - this.height;
		} else {
			this.height = 220;
			this.y = this._ctx.canvas.height - this.height;
			if (G.gameState == 1) {
				if ((G.availableActions & this.actionBit) == this.actionBit) {
					G.canvasManagerField.addTemp(67, new Button(G.i18n.button_play, this.x, () => this.y - 32, null, () => this.onPlayClicked()));
				}
				G.canvasManagerField.addTemp(67, new Button(G.i18n.button_discard, this.x + 80, () => this.y - 32, null, () => this.onDiscardClicked()));
			}
		}
		this.expanded = !this.expanded;
	}

	draw(ctx) {
		ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;
		const r = 6;
		// Card body
		ctx.beginPath();
		ctx.roundRect(this.x, this.y, this.width, this.height, r);
		if (this.clicked) {
			ctx.fillStyle = THEME.cardBg;
			ctx.fill();
			ctx.strokeStyle = THEME.cardSelected;
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.lineWidth = 1;
		} else {
			ctx.fillStyle = THEME.cardBg;
			ctx.fill();
			ctx.strokeStyle = THEME.cardBorder;
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		// Title bar gradient
		if (this.expanded) {
			ctx.save();
			ctx.beginPath();
			ctx.roundRect(this.x, this.y, this.width, 18, [r, r, 0, 0]);
			ctx.clip();
			const tGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 18);
			tGrad.addColorStop(0, THEME.cardTitleBg);
			tGrad.addColorStop(1, THEME.cardTitleBgEnd);
			ctx.fillStyle = tGrad;
			ctx.fillRect(this.x, this.y, this.width, 18);
			ctx.restore();
			// separator
			ctx.strokeStyle = THEME.cardBorder;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y + 18);
			ctx.lineTo(this.x + this.width, this.y + 18);
			ctx.stroke();
		}
		ctx.strokeStyle = '#000000';
		ctx.fillStyle = THEME.cardText;
		ctx.fillText(G.i18n[this.title], this.x + 8, this.y + 14);
		if (typeof this.type !== 'undefined') {
			ctx.fillStyle = THEME.textSecondary;
			ctx.fillText(UIServices.getFieldType(this.type), this.x + this.width - ctx.measureText(this.type).width - 8, this.y + 14);
		}
		if (this.expanded) {
			ctx.fillStyle = THEME.cardText;
			this.drawText(ctx);
			if (typeof this.range !== 'undefined') {
				ctx.fillStyle = THEME.textSecondary;
				ctx.fillText(`E:${this.range}`, this.x + 8, this.y + this.height - 8);
			}
			if (typeof this.localLevelMod !== 'undefined' && this.localLevelMod != 0) {
				const t = `S:${this.localLevelMod}`;
				ctx.fillStyle = THEME.textSecondary;
				ctx.fillText(t, this.x + this.width - ctx.measureText(t).width - 8, this.y + this.height - 8);
			}
		}
	}
}

export class AuctionCard extends BaseCard {
	constructor(id, title, text, x, y, profitConfig, range, localLevelMod, type, ctx) {
		super();
		this.id = id;
		this.title = title;
		this.text = text;
		this.profitConfig = profitConfig;
		this.range = range;
		this.localLevelMod = localLevelMod;
		this.type = type;
		this.x = x;
		this.y = y;
		this.height = 220;
		this.width = 180;
		this.clicked = false;
		this.removed = false;
	}

	draw(ctx) {
		ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;
		const r = 6;
		ctx.beginPath();
		ctx.roundRect(this.x, this.y, this.width, this.height, r);
		if (this.clicked) {
			ctx.fillStyle = THEME.cardBg;
			ctx.fill();
			ctx.strokeStyle = THEME.cardSelected;
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.lineWidth = 1;
		} else if (this.removed) {
			ctx.fillStyle = THEME.cardBg;
			ctx.fill();
			// Dim overlay for removed cards
			ctx.fillStyle = THEME.cardRemoved;
			ctx.fill();
			ctx.strokeStyle = THEME.cardBorder;
			ctx.lineWidth = 1;
			ctx.stroke();
		} else {
			ctx.fillStyle = THEME.cardBg;
			ctx.fill();
			ctx.strokeStyle = THEME.cardBorder;
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		// Title bar
		ctx.save();
		ctx.beginPath();
		ctx.roundRect(this.x, this.y, this.width, 18, [r, r, 0, 0]);
		ctx.clip();
		const tGrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 18);
		tGrad.addColorStop(0, THEME.cardTitleBg);
		tGrad.addColorStop(1, THEME.cardTitleBgEnd);
		ctx.fillStyle = tGrad;
		ctx.fillRect(this.x, this.y, this.width, 18);
		ctx.restore();
		ctx.strokeStyle = THEME.cardBorder;
		ctx.beginPath();
		ctx.moveTo(this.x, this.y + 18);
		ctx.lineTo(this.x + this.width, this.y + 18);
		ctx.stroke();
		ctx.strokeStyle = '#000000';

		ctx.fillStyle = THEME.cardText;
		ctx.fillText(G.i18n[this.title], this.x + 8, this.y + 14);
		if (typeof this.type !== 'undefined') {
			ctx.fillStyle = THEME.textSecondary;
			ctx.fillText(UIServices.getFieldType(this.type), this.x + this.width - ctx.measureText(this.type).width - 8, this.y + 14);
		}
		ctx.fillStyle = THEME.cardText;
		this.drawText(ctx);
		if (typeof this.range !== 'undefined') {
			ctx.fillStyle = THEME.textSecondary;
			ctx.fillText(`E:${this.range}`, this.x + 8, this.y + this.height - 8);
		}
		if (typeof this.localLevelMod !== 'undefined' && this.localLevelMod != 0) {
			const t = `S:${this.localLevelMod}`;
			ctx.fillStyle = THEME.textSecondary;
			ctx.fillText(t, this.x + this.width - ctx.measureText(t).width - 8, this.y + this.height - 8);
		}
	}
}
