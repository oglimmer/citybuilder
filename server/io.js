var http = require('http')
var socketIO = require('socket.io');
var fs = require('fs');
var Config = require('./rule_defines.js').Config;
var log4js = require('log4js');
var LogWrapper = require('./util/logger.js');
var logger = log4js.getLogger('io');

function baseHtmlHandler (req, res) {
	var lang = req.headers["accept-language"];
	logger.debug("Lang:"+lang);
	if((/^de/).test(lang)) {
		lang = "de";
	} else if((/^en/).test(lang)) {
		lang = "en";
	} else {
		lang = "en";
	}

	var urlData = require('url').parse(req.url);
	if(urlData.pathname == "/") {
		urlData.pathname = "/index.html";
	}
	// security: don't allow to step up
	urlData.pathname = urlData.pathname.replace('..','');	
	fs.readFile(__dirname + '/../client/' + urlData.pathname,
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + urlData.pathname );
			}
			res.setHeader("Set-Cookie", ["lang="+lang]);
			if((/\.js$/).test(urlData.pathname)) {
				res.setHeader("Content-Type", "application/javascript");			
			}	
			if((/\.css$/).test(urlData.pathname)) {
				res.setHeader("Content-Type", "text/css");			
			}	
			var dataStr = data.toString();
			if(dataStr.match(/^importFiles/) !== null) {
				var importFiles;
				eval(dataStr);
				var af = "";
				importFiles.forEach(function(e) {
					var of = fs.readFileSync(__dirname+'/../client'+e);
					af += of;
				});
				
				res.writeHead(200);
				res.end(af);

			} else {
				res.writeHead(200);
				res.end(data);				
			}
		}
	);
}

var app = http.createServer(baseHtmlHandler);
var io = socketIO.listen(app, {
	'logger': new LogWrapper()
});
app.listen(Config.httpPort, "127.0.0.1");
logger.info("Server listen on " + Config.httpPort);

require('./ioHandler.js')(io,logger);

module.exports = io