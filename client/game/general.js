/* GENERAL HELPER */
Object.prototype.Inherits = function(parent) {
	if(arguments.length > 1) {
		parent.apply(this, Array.prototype.slice.call(arguments, 1) );
	} else {      
		parent.call(this);
	}
};
Function.prototype.Inherits = function(parent) {
	this.prototype = new parent();
	this.prototype.constructor = this;
	this.prototype.parent = parent.prototype;
};
Array.prototype.removeByObj = function(obj) {
	for(var i = 0 ; i < this.length ; i++) {
		if(this[i] === obj) {
			this.splice(i,1);
			break;
		}
	}
};
Array.prototype.removeById = function(id) {
	for(var i = 0 ; i < this.length ; i++) {
		if(this[i].id == id) {
			this.splice(i,1);
			break;
		}
	}
};