import { describe, it, expect } from 'vitest';
import MonthHelper from '../server/rule_dateutil.js';

describe('MonthHelper', () => {

	it('nextMonth', () => {
		const mh = new MonthHelper();
		const y1 = mh.year;
		const m1 = mh.month;
		mh.nextMonth();
		const y2 = mh.year;
		const m2 = mh.month;
		if (y1 == y2) {
			expect(m2).toBe(m1 + 1);
		} else {
			expect(y2).toBe(y1 + 1);
			expect(m1).toBe(12);
			expect(m2).toBe(1);
		}
	});

	it('reinit', () => {
		const mh = {
			year: 2012,
			month: 8
		};
		MonthHelper.reinit(mh);
		const y1 = mh.year;
		const m1 = mh.month;
		mh.nextMonth();
		const y2 = mh.year;
		const m2 = mh.month;
		if (y1 == y2) {
			expect(m2).toBe(m1 + 1);
		} else {
			expect(y2).toBe(y1 + 1);
			expect(m1).toBe(12);
			expect(m2).toBe(1);
		}
	});
});
