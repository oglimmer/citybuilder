/* Needed for Inheritence */
Function.prototype.Inherits = function(parent) {
	this.prototype = new parent();
	this.prototype.constructor = this;
	this.prototype.parent = parent.prototype;
};

/* const */
var NUMBER_OF_FIELD_TYPES = 7;
var NUMBER_OF_NON_FIELD_TYPE_MODES = 2;

var LOCALLEVEL_MIN_UPPER = 250;
var LOCALLEVEL_MIN_UPPERMIDDLE = 100;
var LOCALLEVEL_MIN_MIDDLE = 30;
var LOCALLEVEL_MIN_LOWERMIDDLE = 0;

/* global variables and functions */
var socket = null;
var G = null;
var GL = null;

$(window).load(function() {
	$("#gameCanvas").attr('width', $(window).width()-225).attr('height', $(window).height()-35);

	G = new Global();
	GL = new GlobalListeners();

	$('.translate').each(function() {	
		$(this).text(G.i18n[$(this).text()]);
	});
	$('input').each(function() {	
		if(($(this).attr('type')) == 'button') {
			$(this).attr('value',G.i18n[$(this).attr('value')]);
		}
	});

	if(Cookie.get("playerId")!="" && Cookie.get("gameId") != "") {		
		G.serverCommListener.init();
		socket.on('reJoinGameCheck_resp', function(data) {
			$('<input type="button" value="'+G.i18n.msg_re_join_game+'" onclick="rejoinGame()">').appendTo('#rejoinDiv');		
		});
		socket.emit('reJoinGameCheck_req', { gameId: Cookie.get("gameId") });
	}	
});