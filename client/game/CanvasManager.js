/* ------------------------------------------ */
/* class CanvasManager */  
/* ------------------------------------------ */
function CanvasManager() {

	this.elements = [/*0: zindex, 1: temporary?, 2: element*/];
	this.enabled = true;

	this.add = function(zindex, element) {
		this.elements.push([zindex,false,element]);
		this.elements.sort(function(a,b){
			return a[0]-b[0];
		});
	}

	this.addTemp = function(zindex, element) {
		this.elements.push([zindex,true,element]);
		this.elements.sort(function(a,b){
			return a[0]-b[0];
		});
	}

	this.clearTemp = function() {
		for(var i = this.elements.length - 1 ; i>= 0 ; i--) {
			if(this.elements[i][1]) {
				this.elements.splice(i,1);
			}
		}
	}

	this.draw = function(ctx) {
		if(this.enabled) {
			for(var i = 0 ; i < this.elements.length ; i++) {
				this.elements[i][2].draw(ctx);
			}
		}
	};

	this.onclick = function(x, y) {
		if(this.enabled) {
			for(var i = this.elements.length - 1 ; i>= 0 ; i--) {
				var ele = this.elements[i][2];
				if(typeof(ele.onclick) === 'function' && ele.onclick(x,y)) {
					return;
				}
			}
		}
	};

	this.getButton = function(x,y) {
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
}