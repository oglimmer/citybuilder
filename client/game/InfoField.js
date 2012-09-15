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
			ctx.fillText(G.i18n.infoField_type+": "+this.field.longText/*+" ("+this.field.type+")"*/, this.x+5, this.y+y); y+=HGAP;
			//ctx.fillText(G.i18n.infoField_pos+": "+this.field.cor(), this.x+5, this.y+y); y+=HGAP;
			//ctx.fillText(G.i18n.infoField_buildState+": "+UIServices.getBuildStateText(this.field.buildState), this.x+5, this.y+y); y+=HGAP;

			if(this.field.type == 0) {
				ctx.fillText(G.i18n.infoField_houseType+": " + UIServices.getHouseTypeText(this.field.attachedCard.houseType)/*+" ("+this.field.attachedCard.houseType+")"*/, this.x+5, this.y+y); y+=HGAP;
				ctx.fillText(G.i18n.infoField_housePop+": " + this.field.attachedCard.housePopulation, this.x+5, this.y+y); ; y+=HGAP;
				ctx.fillText(G.i18n.infoField_localLevel+": "+UIServices.getLocalLevelText(this.field.localLevel)/*+" ("+this.field.localLevel+")"*/, this.x+5, this.y+y); y+=HGAP;				
			} else {
				//ctx.fillText(G.i18n.infoField_attachedCard+": ", this.x+5, this.y+y); y+=HGAP;
				ctx.fillText(G.i18n.infoField_owner+": "+this.field.ownerName/*+" ("+this.field.owner+")"*/, this.x+5, this.y+y); y+=HGAP;
				if(this.field.attachedCard != null) {
					ctx.fillText(G.i18n[this.field.attachedCard.title], this.x+5, this.y+y); y+=HGAP;
					BaseCard.drawText(ctx,""/*G.i18n[this.field.attachedCard.text]*/,this.field.attachedCard.profitConfig,this.x,this.y+y,this.width);
				}
			}
		}
	};
}