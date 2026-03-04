import { G, THEME } from './state.js';
import UIServices from './UIServices.js';

export default class UIElement {
	constructor(item) {
		if (typeof item !== 'undefined') {
			this.drawX = item.x * 55 + Math.floor(item.x / 3) * 5;
			this.drawY = item.y * 55 + Math.floor(item.y / 3) * 5;
			this.x = item.x;
			this.y = item.y;
			this.width = 54;
			this.height = 54;
			this.fillStyleH = null;
			this.fillStyleS = null;
			this.fillStyleN = null;
			this.copyFrom(item);
			this.influenced = 0;
		}
	}

	cor() {
		return `${this.x}:${this.y}`;
	}

	static cor(item) {
		return `${item.x}:${item.y}`;
	}

	draw(ctx, relocateX, relocateY) {
		ctx.beginPath();

		if (this.fillStyleH != null) {
			ctx.fillStyle = this.fillStyleH;
		} else if (this.fillStyleS != null) {
			ctx.fillStyle = this.fillStyleS;
		} else if (this.type == 0) {
			switch (G.uiMode) {
				case 0:
					ctx.fillStyle = this.fillStyleUi0;
					break;
				case 1:
					ctx.fillStyle = this.fillStyleUi2;
					break;
				default:
					ctx.fillStyle = this.fillStyleUi4;
					break;
			}
		} else {
			ctx.fillStyle = this.fillStyleN;
		}
		ctx.fillRect(relocateX + this.drawX, relocateY + this.drawY, this.width, this.height);

		// cell border
		ctx.strokeStyle = THEME.cellBorder;
		ctx.lineWidth = 1;
		ctx.strokeRect(relocateX + this.drawX, relocateY + this.drawY, this.width, this.height);

		if (this.owner == G.playerNo) {
			const ownerColor = THEME.cellOwnerColors[G.playerNo % THEME.cellOwnerColors.length];
			ctx.beginPath();
			ctx.rect(relocateX + this.drawX + 2, relocateY + this.drawY + 2, this.width - 4, this.height - 4);
			ctx.lineWidth = 2;
			ctx.strokeStyle = ownerColor;
			ctx.stroke();
		}
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 1;

		ctx.fillStyle = THEME.cellText;
		if (this.type == 0) {
			ctx.font = `9px ${THEME.fontFamily}`;
			const firstLine = UIServices.getHouseTypeTextShort(this.attachedCard.houseType);
			ctx.fillText(firstLine, relocateX + this.drawX + 26 - ctx.measureText(firstLine).width / 2, relocateY + this.drawY + 20);
			const secondLine = this.attachedCard.housePopulation;
			ctx.fillText(secondLine, relocateX + this.drawX + 26 - ctx.measureText(secondLine).width / 2, relocateY + this.drawY + 38);
			ctx.font = `${THEME.fontSize} ${THEME.fontFamily}`;
		} else {
			ctx.fillText(this.fillText, relocateX + this.drawX + 22, relocateY + this.drawY + 28);
		}
	}

	onclick(x, y) {
		if (this.atPos(x, y)) {
			if (G.fieldPane.selectTargetEnabled) {
				if (G.fieldPane.isSelectable(this)) {
					G.serverCommListener.playCardSelectTarget(this);
					G.fieldPane.setSelectTargetEnabled(false);
				}
			} else {
				G.fieldPane.showInfoField(this);
			}
			return true;
		}
		return false;
	}

	atPos(x, y) {
		return x >= this.drawX && y >= this.drawY && x <= this.drawX + this.width && y <= this.drawY + this.height;
	}

	copyFrom(from) {
		this.type = from.type;
		this.attachedCard = from.attachedCard;
		this.buildState = from.buildState;
		this.owner = from.owner;
		this.ownerName = from.ownerName;
		this.localLevel = from.localLevel;
		this.setBaseFillStyle();
	}

	getText() {
		return `${this.type}, ${this.attachedCard != null ? G.i18n[this.attachedCard.title] : ''}, ${this.buildState}`;
	}

	setBaseFillStyle() {
		this.fillStyleN = THEME.cellTypes[this.type] || THEME.cellTypes['-1'];
		this.fillText = UIServices.getFieldType(this.type);
		this.longText = UIServices.getFieldTypeLong(this.type);

		if (this.attachedCard != null && this.type == 0) {
			if (this.attachedCard.houseType == 1) {
				this.fillStyleUi0 = THEME.cellHouseUi0[0];
			} else if (this.attachedCard.houseType == 2) {
				this.fillStyleUi0 = THEME.cellHouseUi0[1];
			} else if (this.attachedCard.houseType <= 5) {
				this.fillStyleUi0 = THEME.cellHouseUi0[2];
			} else if (this.attachedCard.houseType == 6) {
				this.fillStyleUi0 = THEME.cellHouseUi0[3];
			} else if (this.attachedCard.houseType <= 8) {
				this.fillStyleUi0 = THEME.cellHouseUi0[4];
			} else if (this.attachedCard.houseType <= 10) {
				this.fillStyleUi0 = THEME.cellHouseUi0[5];
			}

			if (this.attachedCard.housePopulation / UIServices.getMaxPop(this.attachedCard.houseType) < 0.5) {
				this.fillStyleUi2 = THEME.cellPopUi2[0];
			} else if (this.attachedCard.housePopulation / UIServices.getMaxPop(this.attachedCard.houseType) < 0.9) {
				this.fillStyleUi2 = THEME.cellPopUi2[1];
			} else {
				this.fillStyleUi2 = THEME.cellPopUi2[2];
			}

			switch (this.influenced) {
				case 0: this.fillStyleUi4 = THEME.cellInfluenceUi4[0]; break;
				case 1: this.fillStyleUi4 = THEME.cellInfluenceUi4[1]; break;
				case 2: this.fillStyleUi4 = THEME.cellInfluenceUi4[2]; break;
				case 3: this.fillStyleUi4 = THEME.cellInfluenceUi4[3]; break;
			}
		}
	}
}
