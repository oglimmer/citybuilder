import { G, NUMBER_OF_FIELD_TYPES, NUMBER_OF_NON_FIELD_TYPE_MODES, THEME } from './state.js';
import UIElement from './UIElement.js';

export default class FieldPane {
	constructor() {
		this.relocateX = 0;
		this.relocateY = 0;
		this.allElements = [];
		this.allElementsByCor = {};
		this.currentHighlight = [];
		this.selectTargetEnabled = false;
		this.surroundingMatrix = [];
		this.selectableType = null;
	}

	static createSurroundingRange(range) {
		const surroundingMatrix = [];
		for (let x = -range; x <= range; x++) {
			for (let y = -range; y <= range; y++) {
				if (x != 0 || y != 0) {
					surroundingMatrix.push([x, y]);
				}
			}
		}
		return surroundingMatrix;
	}

	isSelectable(field) {
		if (this.selectableType === null) {
			return true;
		}
		if (this.selectableType === 'ALL_UNOCCUPIED') {
			return field.type == 0;
		}
		if (this.selectableType.match(/ALL_OCCUPIED_BY_/) !== null) {
			return field.type == this.selectableType.match(/[0-9].*$/);
		}
		if (this.selectableType.match(/ALL_UNOCCUPIED_ABOVE_/) !== null) {
			return field.type == 0 && field.attachedCard.houseType > this.selectableType.match(/[0-9].*$/);
		}
		if (this.selectableType.match(/ALL_UNOCCUPIED_LOWER_/) !== null) {
			return field.type == 0 && field.attachedCard.houseType < this.selectableType.match(/[0-9].*$/);
		}
		return false;
	}

	showInfoField(field) {
		G.infoField.visible = !G.infoField.visible;
		const fieldToUpdate = G.infoField.visible ? field : G.infoField.field;
		G.infoField.field = (G.infoField.visible ? field : null);
		if (fieldToUpdate.attachedCard !== null) {
			const selRange = FieldPane.createSurroundingRange(fieldToUpdate.attachedCard.range);
			for (let j = 0; j < selRange.length; j++) {
				const surroundingElement = this.allElementsByCor[`${fieldToUpdate.x + selRange[j][0]}:${fieldToUpdate.y + selRange[j][1]}`];
				if (typeof surroundingElement !== 'undefined') {
					surroundingElement.fillStyleS = G.infoField.visible ? THEME.infoFieldRange : null;
					surroundingElement.draw(G.ctx, this.relocateX, this.relocateY);
				}
			}
		}
		fieldToUpdate.fillStyleS = G.infoField.visible ? THEME.infoFieldSelected : null;
	}

	draw(ctx) {
		for (let i = 0; i < this.allElements.length; i++) {
			const uiElement = this.allElements[i];
			uiElement.draw(ctx, this.relocateX, this.relocateY);
		}
	}

	onclick(x, y) {
		for (let i = 0; i < this.allElements.length; i++) {
			const uiElement = this.allElements[i];
			if (uiElement.onclick(x - this.relocateX, y - this.relocateY)) {
				return true;
			}
		}
		return false;
	}

	processReceived(data) {
		for (const itemKey in data) {
			const item = data[itemKey];
			if (typeof item === 'object') {
				let found = false;
				for (let i = 0; i < this.allElements.length; i++) {
					const uiElement = this.allElements[i];
					if (uiElement.x == item.x && uiElement.y == item.y) {
						found = true;
						uiElement.copyFrom(item);
						break;
					}
				}
				if (!found) {
					const e = new UIElement(item);
					this.allElements.push(e);
					this.allElementsByCor[UIElement.cor(item)] = e;
				}
			}
		}
		this.repaintTypeInfluence();
		G.draw();
	}

	moveover(x, y) {
		if (!this.selectTargetEnabled) {
			return;
		}
		for (let i = 0; i < this.allElements.length; i++) {
			const uiElement = this.allElements[i];
			if (this.isSelectable(uiElement) && (this.currentHighlight.length == 0 || this.currentHighlight[0] !== uiElement) && uiElement.atPos(x - this.relocateX, y - this.relocateY)) {
				for (let j = 0; j < this.currentHighlight.length; j++) {
					this.currentHighlight[j].fillStyleH = null;
					this.currentHighlight[j].draw(G.ctx, this.relocateX, this.relocateY);
				}
				this.currentHighlight = [];

				uiElement.fillStyleH = THEME.highlightTarget;
				uiElement.draw(G.ctx, this.relocateX, this.relocateY);
				this.currentHighlight.push(uiElement);

				for (let j = 0; j < this.surroundingMatrix.length; j++) {
					const surroundingElement = this.allElementsByCor[`${uiElement.x + this.surroundingMatrix[j][0]}:${uiElement.y + this.surroundingMatrix[j][1]}`];
					if (typeof surroundingElement !== 'undefined') {
						surroundingElement.fillStyleH = surroundingElement.type == 0 ? THEME.highlightRange : THEME.highlightRangeDim;
						surroundingElement.draw(G.ctx, this.relocateX, this.relocateY);
						this.currentHighlight.push(surroundingElement);
					}
				}

				break;
			}
		}
		return false;
	}

	setSelectTargetEnabled(val) {
		this.selectTargetEnabled = val;
		if (!this.selectTargetEnabled) {
			for (let j = 0; j < this.currentHighlight.length; j++) {
				this.currentHighlight[j].fillStyleH = null;
				this.currentHighlight[j].draw(G.ctx, this.relocateX, this.relocateY);
			}
			this.currentHighlight = [];
		}
	}

	repaintTypeInfluence() {
		if (G.uiMode >= NUMBER_OF_NON_FIELD_TYPE_MODES && G.uiMode <= NUMBER_OF_NON_FIELD_TYPE_MODES + NUMBER_OF_FIELD_TYPES) {
			this.calcRanges(G.uiMode - NUMBER_OF_NON_FIELD_TYPE_MODES + 1);
		}
	}

	calcRanges(type) {
		for (let i = 0; i < this.allElements.length; i++) {
			const field = this.allElements[i];
			if (field.type == 0) {
				field.influenced = 0;
			}
		}
		for (let i = 0; i < this.allElements.length; i++) {
			const field = this.allElements[i];
			if (field.type == type) {
				this.forEachField(field.attachedCard.range, field, this.allElementsByCor, (surrField) => {
					if (surrField.type == 0) {
						if (field.owner == G.playerNo) {
							surrField.influenced |= 1;
						} else {
							surrField.influenced |= 2;
						}
					}
				});
			}
		}
		for (let i = 0; i < this.allElements.length; i++) {
			const field = this.allElements[i];
			if (field.type == 0) {
				field.setBaseFillStyle();
			}
		}
	}

	forEachField(range, field, fields, perField) {
		for (let x = -range; x <= range; x++) {
			for (let y = -range; y <= range; y++) {
				if (x != 0 || y != 0) {
					const surroundingElement = fields[`${field.x + x}:${field.y + y}`];
					if (typeof surroundingElement !== 'undefined') {
						perField(surroundingElement);
					}
				}
			}
		}
	}
}
