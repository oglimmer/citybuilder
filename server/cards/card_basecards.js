import { FieldType } from '../rule_defines.js';
import Field from '../rule_field.js';
import log4js from 'log4js';

const logger = log4js.getLogger('card');

let _cardFactory = null;

export class BaseObject {}

export class Card extends BaseObject {
	constructor(id, no) {
		super();
		this.clazz = 'Card';
		this.id = id;
		this.no = no;
		this.title = `c${no}_1`;
		this.text = `c${no}_2`;
		this.actionBit = 0;
		this.playType = 0; // 0 = plays direct, 1 = plays via target selection
	}

	static async reinit(card) {
		if (!_cardFactory) {
			_cardFactory = (await import('../rule_cardfactory.js')).default;
		}
		Object.setPrototypeOf(card, _cardFactory.classNames[`id${card.no}`].prototype);
	}

	static reinitSync(card) {
		Object.setPrototypeOf(card, _cardFactory.classNames[`id${card.no}`].prototype);
	}

	static forEachField(range, field, fields, perField) {
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

export class RentalCard extends Card {
	constructor(id, no, range, type, profitConfig, localLevelMod) {
		super(id, no);
		this.range = range;
		this.type = type;
		this.actionBit = 1;
		this.playType = 1;
		this.profitConfig = profitConfig;
		this.localLevelMod = localLevelMod;
	}

	prePlay() {
		return {
			selectable: 'ALL_UNOCCUPIED',
			range: this.range
		};
	}

	play(field, player) {
		if (field.type == FieldType.HOUSE) {
			field.type = this.type;
			field.owner = player.no;
			field.ownerName = player.playerName;
			field.attachedCard = this;
			field.buildState = 1;
			return { changedFields: Field.asFields(field), secretPlay: false };
		} else {
			throw "error_field_already_occupied";
		}
	}

	static getTypeFromField(field) {
		if (typeof field.attachedCard.getSupplyType !== 'undefined') {
			return field.attachedCard.getSupplyType();
		}
		return field.type;
	}

	calcSupplies(field, fields) {
		Card.forEachField(this.range, field, fields, (surroundingElement) => {
			if (surroundingElement.type == FieldType.HOUSE) {
				if (typeof surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)] === 'undefined') {
					surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)] = 0;
				}
				if (this.getProfit(surroundingElement) > 0) {
					surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)]++;
					logger.debug(`[RentalCard.calcSupplies] for ${surroundingElement.x},${surroundingElement.y} type:${RentalCard.getTypeFromField(field)} to ${surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)]}`);
				}
			}
		});
	}

	calcLocalLevel(field, fields, changedFields) {
		Card.forEachField(this.range, field, fields, (surroundingElement) => {
			if (surroundingElement.type == FieldType.HOUSE) {
				if (typeof this.changeLocalLevel !== 'undefined') {
					if (this.changeLocalLevel(surroundingElement)) {
						logger.debug(`[RentalCard.calcLocalLevel] for ${surroundingElement.x},${surroundingElement.y} to ${surroundingElement.localLevel}`);
						changedFields[`${surroundingElement.x}:${surroundingElement.y}`] = surroundingElement;
					}
				}
			}
		});
	}

	calcRent(field, fields) {
		let totalRent = 0;
		Card.forEachField(this.range, field, fields, (surroundingElement) => {
			if (surroundingElement.type == FieldType.HOUSE) {
				if (surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)] > 0) {
					const profit = this.getProfit(surroundingElement);
					const rent = profit * surroundingElement.attachedCard.housePopulation / surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)];
					logger.debug(`[RentalCard.calcRent] ${surroundingElement.x},${surroundingElement.y} Profit:${profit}, Pop:${surroundingElement.attachedCard.housePopulation}, Supply:${surroundingElement.attachedCard.supply[RentalCard.getTypeFromField(field)]}, Total:${rent}`);
					totalRent += rent;
				}
			}
		});
		logger.debug(`[RentalCard.calcRent] Total rent for ${field.attachedCard.title} (${field.x},${field.y}) = ${totalRent}`);
		return totalRent;
	}

	getProfit(field) {
		let profit = 0;
		this.profitConfig.forEach((e) => {
			if ((e.ht.length == 1 && e.ht[0] == field.attachedCard.houseType) ||
				(e.ht.length == 2 && e.ht[0] <= field.attachedCard.houseType && e.ht[1] >= field.attachedCard.houseType)) {
				profit = e.pro;
			}
		});
		return profit;
	}

	changeLocalLevel(field) {
		field.localLevel += this.localLevelMod;
		return true;
	}
}
