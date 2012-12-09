/* ------------------------------------------ */
/* class GlobalListeners */
/* ------------------------------------------ */
function GlobalListeners() {

	this.buttonDown = false;
	this.moved = false;
	this.startMoveX=0;
	this.startMoveY=0;
	this.mouseDownX=0;
	this.mouseDownY=0;
	this.buttonAtMouseDown = null;

	function getRelMousePos(canvas, evt) {
		var obj = canvas;
		var top = 0;
		var left = 0;
		while (obj && obj.tagName != 'BODY') {
			top += obj.offsetTop;
			left += obj.offsetLeft;
			obj = obj.offsetParent;
		}
		var mouseX = evt.clientX - left + window.pageXOffset;
		var mouseY = evt.clientY - top + window.pageYOffset;
		return {
			x : mouseX,
			y : mouseY
		};
	}

	G.canvas.addEventListener('mousemove', function(evt) {
		var mousePos = getRelMousePos(G.canvas, evt);
		if(this.buttonDown) {
			// a move is: when moved for more than 3 pixels OR once moved keep the flag
			this.moved |= Math.abs(mousePos.x - this.mouseDownX) > 3 || Math.abs(mousePos.y - this.mouseDownY) > 3;			
			G.fieldPane.relocateX +=  (mousePos.x - this.startMoveX);
			G.fieldPane.relocateY +=  (mousePos.y - this.startMoveY);
			this.startMoveX = mousePos.x ;
			this.startMoveY = mousePos.y ;
			G.draw();     
		} else {
			G.fieldPane.moveover(mousePos.x, mousePos.y);
		}
	}, false);

	G.canvas.addEventListener('mouseout', function(evt) {
		this.buttonDown = false;
	}, false);

	G.canvas.addEventListener('mousedown', function(evt) {
		var mousePos = getRelMousePos(G.canvas, evt);
		this.startMoveX = this.mouseDownX = mousePos.x;
		this.startMoveY = this.mouseDownY = mousePos.y;
		this.buttonDown = true;
		this.moved = false;
		this.buttonAtMouseDown = G.getButton(mousePos.x, mousePos.y);
	}, false);

	G.canvas.addEventListener('mouseup', function(evt) {
		this.buttonDown = false;
		var mousePos = getRelMousePos(G.canvas, evt);
		// only fire onClick if not moved or the mouse went down and came up on a button/card
		if(!this.moved || ( this.buttonAtMouseDown !== false && G.getButton(mousePos.x, mousePos.y) === this.buttonAtMouseDown ) ) {						
			G.onclick(mousePos.x, mousePos.y);
			G.draw();   
		}
	}, false);

	$(window).resize(function() {
		$("#gameCanvas").attr('width', $(window).width()-225).attr('height', $(window).height()-35);
		G.resize();
		G.draw();
	});
}
