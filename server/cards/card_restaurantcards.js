import { FieldType } from '../rule_defines.js';
import { RentalCard } from './card_basecards.js';

export class BuildRestaurantCard extends RentalCard {
	constructor(id, no, range, profitConfig, localLevelMod) {
		super(id, no, range, FieldType.FOOD, profitConfig, localLevelMod);
	}
}

export class BuildRestaurantItaSmCard extends BuildRestaurantCard {
	constructor(id) {
		super(id, 0, 2, [{ ht: [5, 10], pro: 20 }], 0);
	}
}

export class BuildRestaurantItaMidCard extends BuildRestaurantCard {
	constructor(id) {
		super(id, 1, 2, [{ ht: [2, 8], pro: 30 }], 0);
	}
}

export class BuildRestaurantItaPreCard extends BuildRestaurantCard {
	constructor(id) {
		super(id, 2, 2, [{ ht: [1], pro: 500 }, { ht: [2, 5], pro: 100 }], 15);
	}
}

export class BuildRestaurantGreekMidCard extends BuildRestaurantCard {
	constructor(id) {
		super(id, 3, 3, [{ ht: [1, 5], pro: 45 }, { ht: [6, 8], pro: 15 }], 5);
	}
}

export class BuildRestaurantChinSmCard extends BuildRestaurantCard {
	constructor(id) {
		super(id, 4, 1, [{ ht: [3, 6], pro: 20 }, { ht: [7, 10], pro: 10 }], 0);
	}
}

export class BuildRestaurantChinLrgCard extends BuildRestaurantCard {
	constructor(id) {
		super(id, 5, 2, [{ ht: [1, 10], pro: 30 }], 0);
	}
}

export class BuildRestaurantSteakPreCard extends BuildRestaurantCard {
	constructor(id) {
		super(id, 6, 2, [{ ht: [1, 5], pro: 200 }], 10);
	}
}

export class BuildRestaurantFrePreCard extends BuildRestaurantCard {
	constructor(id) {
		super(id, 7, 2, [{ ht: [1, 2], pro: 1500 }], 30);
	}
}

export class BuildRestaurantUSFF1Card extends BuildRestaurantCard {
	constructor(id) {
		super(id, 8, 2, [{ ht: [6, 8], pro: 7 }, { ht: [9, 10], pro: 12 }], 0);
	}
}

export class BuildRestaurantUSFF2Card extends BuildRestaurantCard {
	constructor(id) {
		super(id, 9, 2, [{ ht: [5, 8], pro: 5 }, { ht: [9, 10], pro: 13 }], 0);
	}
}

export class BuildRestaurantUSFF3Card extends BuildRestaurantCard {
	constructor(id) {
		super(id, 10, 3, [{ ht: [6, 8], pro: 7 }, { ht: [9, 10], pro: 12 }], 0);
	}
}
