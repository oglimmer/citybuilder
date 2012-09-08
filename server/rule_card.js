var fs=require('fs');

var CARDS_DIRECTORY = '/cards';

var imports=[];
var files = fs.readdirSync(__dirname + CARDS_DIRECTORY); 

files.forEach(function(file){
	if((/\.js$/).test(file)) {
		imports.push( require('.' + CARDS_DIRECTORY + '/' + file) );
	}
});

imports.forEach(function(e) {
	for(var m in e) {
		module.exports[m] = e[m];
	}	
})