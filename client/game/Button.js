/* ------------------------------------------ */
/* class Button */
/* ------------------------------------------ */
function Button(label,x, y, width, onclick) {
	this.label = label;
	this.width = width != null ? width : 60;
	this.height = 20;
	this.enabled = true;
	this.clicked = false;
	this.resize = function() {
		this.x = (typeof(x) === 'function' ? x() : x ) ;
		this.y = (typeof(y) === 'function' ? y() : y ) ;
	}
	this.resize();
	this.draw = function(ctx) {		
		ctx.beginPath();
		ctx.rect(this.x,this.y,this.width,this.height);
		ctx.fillStyle = this.clicked ? '#8ED6BB' : '#8ED6FF';
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = this.enabled ? '#000000' : '#6ED6FF';
		ctx.font = '10px Arial';
		ctx.fillText(typeof this.label === 'function' ? this.label() : this.label, this.x+3, this.y+14);
		ctx.font = '12px Arial';
	};  
	this.onclick = function(x, y) {
		if(this.atPos(x,y)) {
			onclick();
			return true;
		}
		return false;
	};
	this.atPos = function(x, y) {
		return this.enabled && x>=this.x && y>=this.y && x<=this.x+this.width && y <=this.y+this.height;
	};	
}