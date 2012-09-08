/* ------------------------------------------ */
/* class Button */
/* ------------------------------------------ */
function Button(label,parent, x, y, width, onclick) {
	this.label = label;
	this.x = x;
	this.y = y;
	this.width = width != null ? width : 60;
	this.height = 20;
	this.enabled = true;
	this.draw = function(ctx) {
		ctx.beginPath();
		ctx.rect(this.x,this.y,this.width,this.height);
		ctx.fillStyle = '#8ED6FF';
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = this.enabled ? '#000000' : '#6ED6FF';
		ctx.fillText(typeof this.label === 'function' ? this.label() : this.label, this.x+3, this.y+14);
	};  
	this.onclick = function(x, y) {
		if(this.atPos(x,y)) {
			onclick(parent);
			return true;
		}
		return false;
	};
	this.atPos = function(x, y) {
		return this.enabled && x>=this.x && y>=this.y && x<=this.x+this.width && y <=this.y+this.height;
	};	
}