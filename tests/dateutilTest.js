var MonthHelper = require('../server/rule_dateutil.js');


module.exports = {

	nextMonth : function(test) {
		var mh = new MonthHelper();
		var y1 = mh.year;
		var m1 = mh.month;
		mh.nextMonth();
		var y2 = mh.year;
		var m2 = mh.month;
		if(y1==y2) {
			test.ok(m1,m2-1);
		}else {
			test.ok(y1,y2-1);
			test.ok(m1,12);
			test.ok(m2,1);
		}		
		test.done();
	},
	reinit : function(test) {
		var mh = {
			year : 2012,
			month : 8
		};
		MonthHelper.reinit(mh);
		var y1 = mh.year;
		var m1 = mh.month;
		mh.nextMonth();
		var y2 = mh.year;
		var m2 = mh.month;
		if(y1==y2) {
			test.ok(m1,m2-1);
		}else {
			test.ok(y1,y2-1);
			test.ok(m1,12);
			test.ok(m2,1);
		}		
		test.done();
	}

}