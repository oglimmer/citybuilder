import { FieldType } from '../rule_defines.js';
import { RentalCard } from './card_basecards.js';

export class BuildGroceriesCard extends RentalCard {
	constructor(id, no, range, profitConfig, localLevelMod) {
		super(id, no, range, FieldType.GROCERIES, profitConfig, localLevelMod);
	}
}

export class BuildGroceriesSmCard extends BuildGroceriesCard {
	constructor(id) {
		super(id, 100, 3, [{ ht: [1, 4], pro: 100 }, { ht: [5, 8], pro: 20 }, { ht: [9, 10], pro: 2 }], 0);
	}
}

export class BuildGroceriesDisc1Card extends BuildGroceriesCard {
	constructor(id) {
		super(id, 101, 1, [{ ht: [1, 10], pro: 10 }], 0);
	}
}

export class BuildGroceriesDisc2Card extends BuildGroceriesCard {
	constructor(id) {
		super(id, 102, 1, [{ ht: [4, 8], pro: 30 }, { ht: [9, 10], pro: 5 }], 0);
	}
}

export class BuildGroceriesDisc3Card extends BuildGroceriesCard {
	constructor(id) {
		super(id, 103, 1, [{ ht: [8, 10], pro: 15 }], 0);
	}
}

export class BuildGroceriesSuperMartCard extends BuildGroceriesCard {
	constructor(id) {
		super(id, 104, 3, [{ ht: [1, 4], pro: 100 }, { ht: [5, 7], pro: 35 }, { ht: [8, 10], pro: 10 }], 0);
	}
}

export class BuildGroceriesBioSmCard extends BuildGroceriesCard {
	constructor(id) {
		super(id, 105, 2, [{ ht: [1, 2], pro: 300 }, { ht: [3, 5], pro: 80 }], 10);
	}
}

export class BuildGroceriesBioLrgCard extends BuildGroceriesCard {
	constructor(id) {
		super(id, 106, 2, [{ ht: [1, 3], pro: 250 }, { ht: [4, 7], pro: 75 }], 0);
	}
}
