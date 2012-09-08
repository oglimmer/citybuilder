/* ------------------------------------------ */
/* class InfoField */
/* ------------------------------------------ */
function InfoField(ctx) {
	this.field = null;
	this.x = ctx.canvas.width-250;
	this.y = 30;
	this.width = 240;
	this.height = 220;
	this.visible = false;
	this.draw = function(ctx) {  
		if(this.visible) {
			ctx.beginPath();
			ctx.rect(this.x,this.y,this.width,this.height);
			ctx.fillStyle = '#8ED6FF';
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = '#000000';
			var y = 12;
			ctx.fillText(G.i18n.infoField_type+": "+this.field.longText+" ("+this.field.type+")", this.x+5, this.y+y); y+=12;
			ctx.fillText(G.i18n.infoField_pos+": "+this.field.cor(), this.x+5, this.y+y); y+=12;
			ctx.fillText(G.i18n.infoField_buildState+": "+UIServices.getBuildStateText(this.field.buildState), this.x+5, this.y+y); y+=12;

			if(this.field.type == 0) {
				ctx.fillText(G.i18n.infoField_houseType+": " + UIServices.getHouseTypeText(this.field.attachedCard.houseType)+" ("+this.field.attachedCard.houseType+")", this.x+5, this.y+y); y+=12;
				ctx.fillText(G.i18n.infoField_housePop+": " + this.field.attachedCard.housePopulation, this.x+5, this.y+y); ; y+=12;
				ctx.fillText(G.i18n.infoField_localLevel+": "+UIServices.getLocalLevelText(this.field.localLevel)+" ("+this.field.localLevel+")", this.x+5, this.y+y); y+=12;				
			} else {
				y+=10;
				ctx.fillText(G.i18n.infoField_attachedCard+": ", this.x+5, this.y+y); y+=12;
				ctx.fillText(G.i18n.infoField_owner+": "+this.field.ownerName+" ("+this.field.owner+")", this.x+5, this.y+y); y+=12;
				if(this.field.attachedCard != null) {
					ctx.fillText(G.i18n[this.field.attachedCard.title], this.x+5, this.y+y); y+=12;
					this.drawText(ctx,this.y+y,G.i18n[this.field.attachedCard.text]);
				}
			}
		}
	};
	this.setField = function(field) {
		this.field = field;
	}
	this.drawText = function(ctx,y,text) {
		var words = text.split(" ");
		var line = "";
		var tmpY = y;

		for ( var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + " ";
			var metrics = ctx.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > this.width-2) {
				ctx.fillText(line, this.x+5, tmpY);
				line = words[n] + " ";
				tmpY += 12; //lineHeight
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line, this.x+5, tmpY);
	}	
}