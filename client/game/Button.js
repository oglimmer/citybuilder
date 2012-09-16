/* ------------------------------------------ */
/* class Button */
/* ------------------------------------------ */
function Button(label,parent, x, y, width, onclick, contextParam) {
	this.label = label;
	this.x = x;
	this.y = y;
	this.contextParam = contextParam;
	this.width = width != null ? width : 60;
	this.height = 20;
	this.enabled = true;
	this.clicked = false;
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
			onclick(parent, this);
			return true;
		}
		return false;
	};
	this.atPos = function(x, y) {
		return this.enabled && x>=this.x && y>=this.y && x<=this.x+this.width && y <=this.y+this.height;
	};	
}