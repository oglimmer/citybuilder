import { FieldType } from '../rule_defines.js';
import { RentalCard } from './card_basecards.js';

export class BuildElectronicCard extends RentalCard {
	constructor(id, no, range, profitConfig, localLevelMod) {
		super(id, no, range, FieldType.ELECTRONIC, profitConfig, localLevelMod);
	}
}

export class BuildElectronicSmlCard extends BuildElectronicCard {
	constructor(id) {
		super(id, 400, 1, [{ ht: [1, 5], pro: 300 }, { ht: [6, 7], pro: 170 }, { ht: [8, 10], pro: 50 }], 0);
	}
}

export class BuildElectronicLrgCard extends BuildElectronicCard {
	constructor(id) {
		super(id, 401, 3, [{ ht: [1, 3], pro: 750 }, { ht: [4, 7], pro: 40 }, { ht: [8, 10], pro: 20 }], 0);
	}
}
