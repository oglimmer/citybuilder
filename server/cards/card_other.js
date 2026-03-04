import { FieldType, HouseType, HouseTypeMaxPop, HouseTypeReverse, LocalLevel } from '../rule_defines.js';
import { Card } from './card_basecards.js';
import log4js from 'log4js';

const logger = log4js.getLogger('game');

export class GentrificationCard extends Card {
	constructor(id) {
		super(id, 500);
		this.playType = 1;
	}

	prePlay() {
		return {
			selectable: 'ALL_UNOCCUPIED',
			range: 1
		};
	}

	static gentrificate(field, changedFields) {
		if (field.type == FieldType.HOUSE) {
			const oldHouseType = field.attachedCard.houseType;
			[LocalLevel.LOWER_MIDDLE, LocalLevel.MIDDLE, LocalLevel.UPPER_MIDDLE, LocalLevel.UPPERCLASS].forEach((locLev) => {
				if (field.localLevel >= locLev.min && field.localLevel <= locLev.max) {
					if (field.attachedCard.houseType > HouseType[locLev.buildings[locLev.buildings.length - 1]]) {
						const rnd = parseInt(Math.random() * locLev.buildings.length);
						field.attachedCard.houseType = HouseType[locLev.buildings[rnd]];
						field.attachedCard.housePopulation = parseInt(Math.random() * HouseTypeMaxPop[locLev.buildings[rnd]]) + 1;
					}
				}
			});
			if (oldHouseType != field.attachedCard.houseType) {
				changedFields[`${field.x}:${field.y}`] = field;
				logger.debug(`[GentrificationCard] Changed houseType for ${field.x},${field.y} from ${oldHouseType} to ${field.attachedCard.houseType}`);
			}
		}
	}

	play(field, player, fields) {
		const changedFields = {};
		GentrificationCard.gentrificate(field, changedFields);
		Card.forEachField(1, field, fields, (surroundingElement) => {
			GentrificationCard.gentrificate(surroundingElement, changedFields);
		});
		return { changedFields, secretPlay: false };
	}
}

export class MorePopulationCard extends Card {
	constructor(id) {
		super(id, 501);
		this.playType = 1;
		this.range = 2;
	}

	prePlay() {
		return {
			selectable: 'ALL_UNOCCUPIED',
			range: this.range
		};
	}

	static getMaxPop(houseType) {
		return HouseTypeMaxPop[HouseTypeReverse[houseType]];
	}

	static populate(field, changedFields) {
		if (field.type == FieldType.HOUSE) {
			const oldPop = field.attachedCard.housePopulation;
			const maxPop = MorePopulationCard.getMaxPop(field.attachedCard.houseType);
			const rand = parseInt(Math.random() * (maxPop - field.attachedCard.housePopulation)) + 1;
			field.attachedCard.housePopulation += rand;
			field.attachedCard.housePopulation = Math.min(maxPop, field.attachedCard.housePopulation);
			if (oldPop != field.attachedCard.housePopulation) {
				logger.debug(`[MorePopulationCard] Field ${field.x},${field.y} gained ${rand} to now ${field.attachedCard.housePopulation}`);
				changedFields[`${field.x}:${field.y}`] = field;
			}
		}
	}

	play(field, player, fields) {
		const changedFields = {};
		MorePopulationCard.populate(field, changedFields);
		Card.forEachField(this.range, field, fields, (surroundingElement) => {
			MorePopulationCard.populate(surroundingElement, changedFields);
		});
		return { changedFields, secretPlay: false };
	}
}

export class CityGrowsCard extends Card {
	constructor(id, no, houseType, baseLocalLevel) {
		super(id, no);
		this.houseType = houseType;
		this.baseLocalLevel = baseLocalLevel;
	}

	async playDirect(player, onSuccess) {
		const { default: GameManager } = await import('../rule_gamemanager.js');
		const { default: PlayerManager } = await import('../rule_playermanager.js');
		const game = await GameManager.getGame(player.gameId);
		let newFieldList;
		await GameManager.storeGame(game, (gameToPrepare) => {
			newFieldList = gameToPrepare.gameField.add(3, 3, this.houseType, MorePopulationCard.getMaxPop(this.houseType), this.baseLocalLevel);
		});
		await PlayerManager.storePlayer(player, (p) => {
			p.cardHand.removeCardById(this.id);
		});
		onSuccess(newFieldList);
	}
}

export class CityGrowsLowerMiddleclassCard extends CityGrowsCard {
	constructor(id) {
		super(id, 502, HouseType.SIMPLE_BUNGALOW, 0);
	}
}

export class CityGrowsMiddleclassCard extends CityGrowsCard {
	constructor(id) {
		super(id, 503, HouseType.TWO_FAM_HOUSE, 30);
	}
}

export class CityGrowsUnderclassCard extends CityGrowsCard {
	constructor(id) {
		super(id, 504, HouseType.CHARITY_BUILDING, -10);
	}
}

export class NewPeopleCard extends Card {
	constructor(id) {
		super(id, 505);
		this.playType = 1;
	}

	prePlay() {
		return {
			selectable: 'ALL_UNOCCUPIED',
			range: 1
		};
	}

	static newPeople(field, changedFields) {
		if (field.type == FieldType.HOUSE) {
			const oldHouseType = field.attachedCard.houseType;
			const currentHouseTypeName = HouseTypeReverse[oldHouseType];
			let currentLocalLevel = null;
			[LocalLevel.UNDERCLASS, LocalLevel.LOWER_MIDDLE, LocalLevel.MIDDLE, LocalLevel.UPPER_MIDDLE, LocalLevel.UPPERCLASS].forEach((locLev) => {
				locLev.buildings.forEach((buildName) => {
					if (buildName == currentHouseTypeName) {
						currentLocalLevel = locLev;
					}
				});
			});
			if (currentLocalLevel == null) {
				logger.error("[newPeople] currentLocalLevel was null, %j", field);
				return;
			}
			const rnd = parseInt(Math.random() * currentLocalLevel.buildings.length);
			const newHouseType = HouseType[currentLocalLevel.buildings[rnd]];
			const newHousePopulation = parseInt(Math.random() * HouseTypeMaxPop[currentLocalLevel.buildings[rnd]]) + 1;
			if ((newHouseType < field.attachedCard.houseType && newHouseType != HouseType.SIMPLE_BUNGALOW) || newHousePopulation > field.attachedCard.housePopulation) {
				field.attachedCard.houseType = newHouseType;
				field.attachedCard.housePopulation = newHousePopulation;
				changedFields[`${field.x}:${field.y}`] = field;
				logger.debug(`[NewPeopleCard] Changed houseType for ${field.x},${field.y} from ${oldHouseType} to ${field.attachedCard.houseType}`);
			}
		}
	}

	play(field, player, fields) {
		const changedFields = {};
		NewPeopleCard.newPeople(field, changedFields);
		Card.forEachField(1, field, fields, (surroundingElement) => {
			NewPeopleCard.newPeople(surroundingElement, changedFields);
		});
		return { changedFields, secretPlay: false };
	}
}
