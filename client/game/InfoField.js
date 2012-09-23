/* ------------------------------------------ */
/* class InfoField */
/* ------------------------------------------ */
function InfoField(ctx) {
	this.field = null;
	this.x = ctx.canvas.width-224;
	this.y = 60;
	this.width = 216;
	this.height = 264;
	this.visible = false;
	this.draw = function(ctx) {  
		if(this.visible) {
			ctx.beginPath();
			ctx.rect(this.x,this.y,this.width,this.height);
			ctx.fillStyle = '#8ED6FF';
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = '#000000';
			var y = 18;
			var HGAP = 18;

			if(this.field.type == 0) {
				ctx.fillText(G.i18n.infoField_houseType+": " + UIServices.getHouseTypeText(this.field.attachedCard.houseType)/*+" ("+this.field.attachedCard.houseType+")"*/, this.x+5, this.y+y); y+=HGAP;
				ctx.fillText(G.i18n.infoField_housePop+": " + this.field.attachedCard.housePopulation, this.x+5, this.y+y); ; y+=HGAP;
				ctx.fillText(G.i18n.infoField_localLevel+": "+UIServices.getLocalLevelText(this.field.localLevel)+" ("+this.field.localLevel+")", this.x+5, this.y+y); y+=HGAP;				
			} else {							
				ctx.fillText(G.i18n[this.field.attachedCard.title], this.x+5, this.y+y);
				ctx.fillText(this.field.fillText, this.x+this.width-5-ctx.measureText(this.field.fillText).width, this.y+y); y+=HGAP;

				ctx.fillText(G.i18n.infoField_owner+": "+this.field.ownerName, this.x+5, this.y+y); y+=HGAP;
				ctx.rect(this.x,this.y+y-5,this.width,0);y+=HGAP;
				ctx.stroke();
				BaseCard.drawText(ctx,"",this.field.attachedCard.profitConfig,this.x,this.y+y,this.width);
				if(typeof(this.field.attachedCard.range) !== 'undefined') {
					ctx.fillText("E:"+this.field.attachedCard.range, this.x+5, this.y+this.height-5);
				}	
				if(typeof(this.field.attachedCard.localLevelMod) !== 'undefined' && this.localLevelMod != 0) {
					var t = "S:"+this.field.attachedCard.localLevelMod;
					ctx.fillText(t, this.x+this.width-ctx.measureText(t).width-4, this.y+this.height-5);
				}							
			}
		}
	};
	this.resize = function() {
		this.x = ctx.canvas.width-224;
	}		
}