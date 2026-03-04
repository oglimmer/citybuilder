import { G, THEME } from './state.js';
import { BaseCard } from './Card.js';
import UIServices from './UIServices.js';

export default class InfoField {
	constructor(ctx) {
		this.field = null;
		this.x = ctx.canvas.width - 224;
		this.y = 60;
		this.width = 216;
		this.height = 264;
		this.visible = false;
		this._ctx = ctx;
	}

	draw(ctx) {
		if (this.visible) {
			ctx.beginPath();
			ctx.roundRect(this.x, this.y, this.width, this.height, 8);
			ctx.fillStyle = THEME.infoFieldBg;
			ctx.fill();
			ctx.strokeStyle = THEME.infoFieldBorder;
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.strokeStyle = '#000000';
			ctx.font = `11px ${THEME.fontFamily}`;
			let y = 18;
			const HGAP = 18;

			if (this.field.type == 0) {
				ctx.fillStyle = THEME.infoFieldHeader;
				ctx.fillText(`${G.i18n.infoField_houseType}: ${UIServices.getHouseTypeText(this.field.attachedCard.houseType)}`, this.x + 8, this.y + y); y += HGAP;
				ctx.fillStyle = THEME.infoFieldText;
				ctx.fillText(`${G.i18n.infoField_housePop}: ${this.field.attachedCard.housePopulation}`, this.x + 8, this.y + y); y += HGAP;
				ctx.fillText(`${G.i18n.infoField_localLevel}: ${UIServices.getLocalLevelText(this.field.localLevel)} (${this.field.localLevel})`, this.x + 8, this.y + y); y += HGAP;
			} else {
				ctx.fillStyle = THEME.infoFieldHeader;
				ctx.fillText(G.i18n[this.field.attachedCard.title], this.x + 8, this.y + y);
				ctx.fillStyle = THEME.textSecondary;
				ctx.fillText(this.field.fillText, this.x + this.width - 8 - ctx.measureText(this.field.fillText).width, this.y + y); y += HGAP;

				ctx.fillStyle = THEME.infoFieldText;
				ctx.fillText(`${G.i18n.infoField_owner}: ${this.field.ownerName}`, this.x + 8, this.y + y); y += HGAP;
				// subtle separator
				ctx.strokeStyle = THEME.panelBorder;
				ctx.beginPath();
				ctx.moveTo(this.x + 8, this.y + y - 5);
				ctx.lineTo(this.x + this.width - 8, this.y + y - 5);
				ctx.stroke();
				ctx.strokeStyle = '#000000';
				y += HGAP;
				ctx.fillStyle = THEME.infoFieldText;
				BaseCard.drawText(ctx, '', this.field.attachedCard.profitConfig, this.x, this.y + y, this.width);
				if (typeof this.field.attachedCard.range !== 'undefined') {
					ctx.fillText(`E:${this.field.attachedCard.range}`, this.x + 8, this.y + this.height - 8);
				}
				if (typeof this.field.attachedCard.localLevelMod !== 'undefined' && this.localLevelMod != 0) {
					const t = `S:${this.field.attachedCard.localLevelMod}`;
					ctx.fillText(t, this.x + this.width - ctx.measureText(t).width - 8, this.y + this.height - 8);
				}
			}
			ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;
		}
	}

	resize() {
		this.x = this._ctx.canvas.width - 224;
	}
}
