function changeHelp(helpId) {
	$('#help').html(G.i18n["help_"+helpId]);
}
function validateInput(playerName) {
	if(playerName == '') {
		alert(G.i18n.error_noname);
		return false;
	}
	return true;
}
function createGame() {
	var playerName = $("#playerName").val();
	if(validateInput(playerName)) {
		$('#top').hide();
		$('#waitingForPlayers').show();
		G.serverCommListener.init();
		socket.emit('createGame_req', { playerName: playerName });
		changeHelp(1);
	}
}
function listGames() {
	G.serverCommListener.init();
	socket.on('listGames_resp', listGames_resp);
	socket.emit('listGames_req');
}
function listGames_resp(data) {
	if(data.length > 0 ) {		
		$('#availGamesDiv').html("<br/>"+G.i18n.msg_games_available+":<br/>");
		var s = $('<select id="availGamesSel" />');	
		$.each(data, function(index, value) { 
	  		$('<option value="' + value.gameId +'">' + "With "+ (value.players.length == 0 ? G.i18n.msg_nobody_at_the_moment : value.players) +'</option>').appendTo(s);
		});
		s.appendTo('#availGamesDiv');
		$('<br/>').appendTo('#availGamesDiv');
		$('<input type="button" value="'+G.i18n.msg_join_selected_game+'" onclick="joinGame()">').appendTo('#availGamesDiv');		
	}
	changeHelp(2);
}
function joinGame() {
	var playerName = $("#playerName").val();	
	if(validateInput(playerName)) {
		$('#top').hide();
		$('#waitingForPlayers').show();
		var gameId = $("#availGamesSel").val();		
		socket.emit('joinGame_req', { gameId: gameId, playerName: playerName });	
		changeHelp(3);
	}
}
function rejoinGame() {
	$('#top').hide();
	$('#bottom').show();
	var gameId = Cookie.get("gameId");
	var playerId = Cookie.get("playerId");	
	socket.emit('reJoinGame_req', { gameId: gameId, playerId: playerId });	
}
function startGame() {
	socket.emit('startGame', { playTime : $('#playTime').val() });
}
