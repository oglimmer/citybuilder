import { FieldType } from '../rule_defines.js';
import { RentalCard } from './card_basecards.js';

export class BuildCriminalCard extends RentalCard {
	constructor(id, no, range, profitConfig, localLevelMod) {
		super(id, no, range, FieldType.CRIMINAL, profitConfig, localLevelMod);
	}
}

export class AddCriminals1Card extends BuildCriminalCard {
	constructor(id) {
		super(id, 800, 2, [{ ht: [9, 10], pro: 3 }], -105);
	}

	prePlay() {
		return {
			selectable: 'ALL_UNOCCUPIED_ABOVE_8',
			range: this.range
		};
	}

	play(field, player) {
		if (field.attachedCard.houseType < 9) {
			throw "error_housetype_too_low";
		}
		return super.play(field, player);
	}

	getSupplyType() {
		return "AddCriminals1Card";
	}
}

export class AddCriminals2Card extends BuildCriminalCard {
	constructor(id) {
		super(id, 801, 2, [{ ht: [7, 8], pro: 15 }, { ht: [9, 10], pro: 2 }], -55);
	}

	prePlay() {
		return {
			selectable: 'ALL_UNOCCUPIED_ABOVE_6',
			range: this.range
		};
	}

	play(field, player) {
		if (field.attachedCard.houseType < 7) {
			throw "error_housetype_too_low";
		}
		return super.play(field, player);
	}

	getSupplyType() {
		return "AddCriminals2Card";
	}
}

export class AddCriminals3Card extends BuildCriminalCard {
	constructor(id) {
		super(id, 802, 2, [{ ht: [1, 2], pro: 1500 }, { ht: [3, 4], pro: 200 }], -5);
	}

	prePlay() {
		return {
			selectable: 'ALL_UNOCCUPIED_LOWER_5',
			range: this.range
		};
	}

	play(field, player) {
		if (field.attachedCard.houseType > 4) {
			throw "error_housetype_too_low";
		}
		return super.play(field, player);
	}

	getSupplyType() {
		return "AddCriminals2Card";
	}
}
