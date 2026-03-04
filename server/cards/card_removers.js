import { FieldType, HouseType } from '../rule_defines.js';
import { RentalCard } from './card_basecards.js';

export class RemoveBuildingCard extends RentalCard {
	constructor(id, no, removableType) {
		super(id, no, 0, FieldType.HOUSE, [], 0);
		this.removableType = removableType;
	}

	prePlay() {
		return {
			selectable: `ALL_OCCUPIED_BY_${this.removableType}`,
			range: this.range
		};
	}

	play(field, player) {
		if (field.type !== FieldType.HOUSE) {
			field.type = this.type;
			field.owner = null;
			field.ownerName = null;
			field.attachedCard = {
				houseType: HouseType.SIMPLE_BUNGALOW,
				housePopulation: Math.floor(Math.random() * 4) + 1,
				supply: []
			};
			field.buildState = 1;
			return { changedFields: {}, secretPlay: true };
		} else {
			throw "error_field_is_not_occupied";
		}
	}
}

export class RemoveFoodCard extends RemoveBuildingCard {
	constructor(id) {
		super(id, 700, FieldType.FOOD);
	}
}

export class RemoveClothingCard extends RemoveBuildingCard {
	constructor(id) {
		super(id, 701, FieldType.CLOTHING);
	}
}

export class RemoveGroceriesCard extends RemoveBuildingCard {
	constructor(id) {
		super(id, 702, FieldType.GROCERIES);
	}
}

export class RemoveJeweleryCard extends RemoveBuildingCard {
	constructor(id) {
		super(id, 703, FieldType.JEWELERY);
	}
}

export class RemoveElectronicCard extends RemoveBuildingCard {
	constructor(id) {
		super(id, 704, FieldType.ELECTRONIC);
	}
}

export class RemoveLocalLevelCard extends RemoveBuildingCard {
	constructor(id) {
		super(id, 705, FieldType.LOCALLEVEL);
	}
}
