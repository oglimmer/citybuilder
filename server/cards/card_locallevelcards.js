import { FieldType } from '../rule_defines.js';
import { RentalCard } from './card_basecards.js';

export class BuildLocalLevelCard extends RentalCard {
	constructor(id, no, range, profitConfig, localLevelMod) {
		super(id, no, range, FieldType.LOCALLEVEL, profitConfig, localLevelMod);
	}
}

export class BuildLocalLevelPoliceCard extends BuildLocalLevelCard {
	constructor(id) {
		super(id, 600, 1, [], 150);
	}
}

export class BuildLocalLevelHospitalCard extends BuildLocalLevelCard {
	constructor(id) {
		super(id, 601, 2, [], 70);
	}
}

export class BuildLocalLevelFirestationCard extends BuildLocalLevelCard {
	constructor(id) {
		super(id, 602, 3, [], 30);
	}
}
