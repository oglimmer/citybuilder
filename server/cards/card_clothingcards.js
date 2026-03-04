import { FieldType } from '../rule_defines.js';
import { RentalCard } from './card_basecards.js';

export class BuildClothingCard extends RentalCard {
	constructor(id, no, range, profitConfig, localLevelMod) {
		super(id, no, range, FieldType.CLOTHING, profitConfig, localLevelMod);
	}
}

export class BuildClothingUltraCheapCard extends BuildClothingCard {
	constructor(id) {
		super(id, 200, 2, [{ ht: [9, 10], pro: 1 }], -5);
	}
}

export class BuildClothingCheapCard extends BuildClothingCard {
	constructor(id) {
		super(id, 201, 2, [{ ht: [5, 7], pro: 30 }, { ht: [8, 10], pro: 10 }], 0);
	}
}

export class BuildClothingCheapLrgCard extends BuildClothingCard {
	constructor(id) {
		super(id, 202, 3, [{ ht: [4, 6], pro: 30 }, { ht: [7, 8], pro: 10 }, { ht: [9, 10], pro: 5 }], 0);
	}
}

export class BuildClothingCheapYoungCard extends BuildClothingCard {
	constructor(id) {
		super(id, 203, 2, [{ ht: [5], pro: 45 }, { ht: [6, 8], pro: 10 }, { ht: [9, 10], pro: 12 }], 0);
	}
}

export class BuildClothingLux1Card extends BuildClothingCard {
	constructor(id) {
		super(id, 204, 1, [{ ht: [1, 2], pro: 100 }, { ht: [3, 6], pro: 35 }], 5);
	}
}

export class BuildClothingLux2Card extends BuildClothingCard {
	constructor(id) {
		super(id, 205, 2, [{ ht: [1, 2], pro: 1600 }], 10);
	}
}

export class BuildClothingFatCard extends BuildClothingCard {
	constructor(id) {
		super(id, 206, 2, [{ ht: [2, 3], pro: 150 }, { ht: [4, 7], pro: 45 }, { ht: [8, 10], pro: 7 }], 0);
	}
}

export class BuildClothingRegLrgCard extends BuildClothingCard {
	constructor(id) {
		super(id, 207, 2, [{ ht: [2, 4], pro: 250 }, { ht: [5, 7], pro: 30 }], 0);
	}
}

export class BuildClothingTeenPreCard extends BuildClothingCard {
	constructor(id) {
		super(id, 208, 4, [{ ht: [3], pro: 250 }, { ht: [4], pro: 50 }], 5);
	}
}
