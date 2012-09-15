/* ------------------------------------------ */
/* class CanvasManager */  
/* ------------------------------------------ */
function CanvasManager() {

	this.elements = [/*0: zindex, 1: temporary?, 2: element*/];
	this.enabled = true;
}

CanvasManager.prototype.Inherits = function(parent) {
	if(arguments.length > 1) {
		parent.apply(this, Array.prototype.slice.call(arguments, 1) );
	} else {      
		parent.call(this);
	}
};

CanvasManager.prototype.add = function(zindex, element) {
	this.elements.push([zindex,false,element]);
	this.elements.sort(function(a,b){
		return a[0]-b[0];
	});
}

CanvasManager.prototype.addTemp = function(zindex, element) {
	this.elements.push([zindex,true,element]);
	this.elements.sort(function(a,b){
		return a[0]-b[0];
	});
}

CanvasManager.prototype.clearTemp = function() {
	for(var i = this.elements.length - 1 ; i>= 0 ; i--) {
		if(this.elements[i][1]) {
			this.elements.splice(i,1);
		}
	}
}

CanvasManager.prototype.draw = function(ctx) {
	if(this.enabled) {
		for(var i = 0 ; i < this.elements.length ; i++) {
			this.elements[i][2].draw(ctx);
		}
	}
};

CanvasManager.prototype.onclick = function(x, y) {
	if(this.enabled) {
		for(var i = this.elements.length - 1 ; i>= 0 ; i--) {
			var ele = this.elements[i][2];
			if(typeof(ele.onclick) === 'function' && ele.onclick(x,y)) {
				return;
			}
		}
	}
};

CanvasManager.prototype.getButton = function(x,y) {
	if(this.enabled) {
		for(var i = this.elements.length - 1 ; i>= 0 ; i--) {
			var ele = this.elements[i][2];
			if(typeof(ele.atPos) === 'function' && ele.atPos(x,y)) {
				return ele;
			}
			else if(typeof(ele.getButton) === 'function' && ele.getButton(x,y)) {
				return ele;
			}
		}
	}
	return false;
}	

/* ------------------------------------------ */
/* class CanvasManagerUIMode */  
/* ------------------------------------------ */
CanvasManagerUIMode.Inherits(CanvasManager);
function CanvasManagerUIMode() {
	this.Inherits(CanvasManager);
}
CanvasManagerUIMode.prototype.onclick = function(x,y) {
	if(this.enabled) {
		for(var i = this.elements.length - 1 ; i>= 0 ; i--) {
			var ele = this.elements[i][2];
			if(typeof(ele.onclick) === 'function' && ele.onclick(x,y)) {
				if(typeof(this.currrentlyClicked) !== 'undefined') {
					this.currrentlyClicked.clicked = false;
				}
				this.currrentlyClicked = ele;
				return;
			}
		}
	}
}
CanvasManagerUIMode.prototype.setClicked = function(ele) {
	this.currrentlyClicked = ele;
	ele.clicked = true;
}