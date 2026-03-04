export default class MonthHelper {
	constructor() {
		this.year = 2012;
		this.month = 8;
	}

	toString() {
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return `${months[this.month - 1]} ${this.year}`;
	}

	nextMonth() {
		this.month++;
		if (this.month > 12) {
			this.month = 1;
			this.year++;
		}
	}

	static reinit(body) {
		Object.setPrototypeOf(body, MonthHelper.prototype);
	}
}
