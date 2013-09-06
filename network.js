var http = require('http');
var fs = require('fs');
var socketIO = require('socket.io');
var mime = require('mime');



function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

var server = http.createServer(function (req, res) {
	console.log("hello");
	fs.readFile('.' + req.url, function (err, data) {
		if (err)
		{
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write(err.toString());
			res.end();
		}
		else
		{
			//var stats = fs.statSync('.' + req.url);
			var cType = mime.lookup('.' + req.url);
			res.writeHead(200, {'Content-Type': cType});
			res.write(data);
			//res.write(cType.toString());
			res.end();
		}
		
	});
	
	
});
server.listen(8080);

var io = socketIO.listen(server);

var something = undefined;

io.sockets.on('connection', function (socket) {
	Debug("connected");
	
	socket.on("D", function (data) {
		Debug("D");
		Debug(data);
	});
	socket.on("E", function(data) {
		Debug("E");
		Debug(data);
	});
	//ClearConnectionsXY(0, 0, 34, 34);
	//socket.emit("map", area);

	socket.on("Request", function (data) {
		Debug(data);
		socket.emit("Something", something);
	})
	AreaCompressor();
	socket.emit("compressedArea", compressedArea);
	EntityCompressor();
	socket.emit("compressedEntities", compressedEntities);

	//Input
	socket.on("Input", function (data) {
		EntityAction(player, data);
	});
});