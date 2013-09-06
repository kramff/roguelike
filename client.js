;
//var socket = io.connect('http://130.215.239.82');

var socket = io.connect('http://localhost:8080');

socket.on("a", function (data) {
	Debug("a");
	Debug(data);
});

socket.on("b", function (data) {
	Debug("b");
	Debug(data);
});

socket.on("c", function (data) {
	Debug("c");
	Debug(data);
});

socket.on("map", function (data) {
	area = data;
});



var something = undefined;

socket.emit("Request", "...");

socket.on("Something", function (data) {
	Debug("Got something");
	Debug(data);
	something = data;
});

var recievedArea = undefined;
var recievedEntities = undefined;

var areaImported = false;
var entitiesImported = false;

socket.on("compressedArea", function (data) {
	recievedArea = data;
	Debug("Got comp. area");
	ImportArea();
	areaImported = true;
	if (entitiesImported)
	{
		PlaceEntities();
		areaImported = false;
		entitiesImported = false;
	}
})


socket.on("compressedEntities", function (data) {
	recievedEntities = data;
	Debug("Got comp. entities");
	ImportEntities();
	entitiesImported = true;
	if (areaImported)
	{
		PlaceEntities();
		areaImported = false;
		entitiesImported = false;
	}
})

function ImportArea () {
	area = recievedArea;
	for (var i = 0; i < area.length; i++) {
		for (var j = 0; j < area[i].length; j++) {
			var tile = area[i][j];
		
			tile.entities = [];
			tile.effects = [];
			tile.items = [];
			tile.tNumber = -1;
			tile.eDrawn = false;
		}
	}
}

function ImportEntities () {
	entityList = recievedEntities;
	for (var i = 0; i < entityList.length; i++)
	{
		var entity = entityList[i];
		entity.GetTile = function () {
			return area[this.x][this.y];
		};
	}
}

function PlaceEntities () {
	for (var i = 0; i < entityList.length; i++)
	{
		var entity = entityList[i];
		entity.GetTile().entities.push(entity);
	}
	SetUpRender();
}

function SendKeyInput (key) {
	socket.emit("Input", key);
}