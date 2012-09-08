

function MonthHelper() {
	this.year = 2012;
	this.month = 8;
};

MonthHelper.prototype.toString = function() {
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	return months[this.month-1]+" "+this.year;
}

MonthHelper.prototype.nextMonth = function() {
	this.month++;
	if(this.month>12) {
		this.month = 1;
		this.year++;
	}
}

MonthHelper.reinit = function(body) {
	body.__proto__ = MonthHelper.prototype;
}

module.exports = MonthHelper;
