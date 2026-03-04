import { FieldType } from '../rule_defines.js';
import { RentalCard } from './card_basecards.js';

export class BuildJeweleryCard extends RentalCard {
	constructor(id, no, range, profitConfig, localLevelMod) {
		super(id, no, range, FieldType.JEWELERY, profitConfig, localLevelMod);
	}
}

export class BuildJeweleryCheapCard extends BuildJeweleryCard {
	constructor(id) {
		super(id, 300, 2, [{ ht: [5, 8], pro: 30 }, { ht: [9, 10], pro: 10 }], 0);
	}
}

export class BuildJeweleryMidCard extends BuildJeweleryCard {
	constructor(id) {
		super(id, 301, 2, [{ ht: [1, 3], pro: 150 }, { ht: [4, 6], pro: 60 }, { ht: [7, 8], pro: 20 }], 0);
	}
}

export class BuildJeweleryPreCard extends BuildJeweleryCard {
	constructor(id) {
		super(id, 302, 3, [{ ht: [1], pro: 2000 }, { ht: [2], pro: 100 }], 15);
	}
}
