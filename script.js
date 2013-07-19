// adv roguelike
// Copyright Mark Foster 2013
// All Rights Reserved


// Much work transfered from ADV 3D project

var cursorVisible = true;


// Canvas and context declaration
var canvas = document.getElementById('Canvas2D');
var ctx = canvas.getContext('2d');
// Size of canvas (pixels)
var CANVAS_WIDTH = 630;
var CANVAS_HEIGHT = 630;

// Size of area (three-dimensional array of Tile objects)
var AREA_SIZE = 35;
var AREA_WIDTH = 35;
var AREA_HEIGHT = 35;

// True after doing Init function
var ready = false;
// True after setting up render canvases
var renderReady = false;

// Message input variables
var enterPressed = false;
var writingMessage = false;
var messageInput = "";
var shiftPressed = false;
// Created after player entity is ready
var promptMessage;
// Used to detect when to make promptMessage spiffy
var isPromptMagic = false;
var textGlow = 0;

// Game data arrays
var area = [];
var entityList = [];
var messages = [];
var effectList = [];
var itemList = [];

// Rendering data arrays
//var layerList = []; // For DrawLayer objects

var tCanvas = document.createElement('canvas');
tCanvas.setAttribute("id", "t canvas");
tCanvas.width = 30 * AREA_WIDTH;
tCanvas.height = 30 * AREA_HEIGHT;
var tctx = tCanvas.getContext('2d');

var eCanvas = document.createElement('canvas');
eCanvas.setAttribute("id", "e canvas");
eCanvas.width = 30 * AREA_WIDTH;
eCanvas.height = 30 * AREA_HEIGHT;
var ectx = this.eCanvas.getContext('2d');

// Camera and target camera positions
var cameraX = 30;
var cameraY = 30;
var targetX = 30;
var targetY = 30;

// Mouse position and movement key booleans
var inputDelay = 10;

var mouseX = 250;
var mouseY = 250;
var wKey = false;
var aKey = false;
var sKey = false;
var dKey = false;
var upKey = false;
var downKey = false;
var leftKey = false;
var rightKey = false;
var releasedAttack = false;

var effectImages = ["circle1", "circle2", "circle3", "circle4", "circle5", "circle6", "lightning1", "lightning2", "lightning3",
"lightningR1", "lightningR2", "lightningR3", "square1", "square2", "square3", "square4", "square5", "square6", "square7", "square8",
"teleport1", "teleport2", "teleport3", "teleport4", "teleport5", "teleport6", "teleport7", "toggle", "triangle1", "triangle2", "triangle3", "triangle4", "triangle5", "triangle6",
"slash1U", "slash2U", "slash3U", "slash4U", "slash5U", "slash1D", "slash2D", "slash3D", "slash4D", "slash5D", 
"slash1L", "slash2L", "slash3L", "slash4L", "slash5L", "slash1R", "slash2R", "slash3R", "slash4R", "slash5R"];
var entityImages = ["player", "A", "B", "C", "D", "E"];
var floorImages = ["blocks", "boxes", "bubbles", "checker", "concentric", "cornered", "delete", "detail", "elegant", "faded", "fine", "invalid", "neat", "nice", "null", "ornate", "rim", "simple", "solid"];


var otherImages = ["appear", "ivy", "target", "web"];
var wallImages = ["double", "full", "line", "pattern"];

var imageSources = [];

var loadi = 0;
for (loadi = 0; loadi < effectImages.length; loadi++)
{
	imageSources.push("Images/Effect/" + effectImages[loadi] + ".png");
}
for (loadi = 0; loadi < entityImages.length; loadi++)
{
	imageSources.push("Images/Entity/" + entityImages[loadi] + ".png");
}
for (loadi = 0; loadi < floorImages.length; loadi++)
{
	imageSources.push("Images/Tilesets/Floor/" + floorImages[loadi] + ".png");
}
for (loadi = 0; loadi < otherImages.length; loadi++)
{
	imageSources.push("Images/Tilesets/Other/" + otherImages[loadi] + ".png");
}
for (loadi = 0; loadi < wallImages.length; loadi++)
{
	imageSources.push("Images/Tilesets/Wall/" + wallImages[loadi] + ".png");
}

var images = [];
var filteredImages = [];

var fCanvas = document.createElement('canvas');
	fCanvas.setAttribute("id", "canvasF");
	fCanvas.width = 1410; // 30 px * 47 tiles
	fCanvas.height = 30;
var fctx = fCanvas.getContext('2d');


for (var i = 0; i < imageSources.length; i += 1) {
	images.push(new Image());
	images[i].src = imageSources[i];
}

function GetEffectImage (name)
{return imageSources.indexOf("Images/Effect/" + name + ".png");}
function GetEntityImage (name)
{return imageSources.indexOf("Images/Entity/" + name + ".png");}
function GetFloorImage (name)
{return imageSources.indexOf("Images/Tilesets/Floor/" + name + ".png");}
function GetOtherImage (name)
{return imageSources.indexOf("Images/Tilesets/Other/" + name + ".png");}
function GetWallImage (name)
{return imageSources.indexOf("Images/Tilesets/Wall/" + name + ".png");}

function GetSNum (name)
{
	return imageSources.indexOf(name);
}

// Creates a FilteredImage object
// Assumes that input is only transparent and white
function FilteredImage (name)
{
	// name: name of image file (from imageSources array)
	this.name = name;
	// base image (from images array)
	this.base = images[GetSNum(name)];
	// add this to filteredImages at correct location
	filteredImages[GetSNum(name)] = this;
	// Image manipulation stuff
	fCanvas.width = this.base.width;
	fCanvas.height = this.base.height;
	fctx.drawImage(this.base, 0, 0);
	//var imgData = fctx.getImageData(0, 0, this.base.width, this.base.height);
	//var d = imgData.data;
	// colors: the array to access to use the filtered images
	this.colors = [];
	
	// GetColor(): Function to get a color-shifted version of an image. saves to colors[] for future use.
	this.GetColor = function (color)
	{
		var num = parseInt("0x" + color.slice(1, 7));
		if (this.colors[num] != undefined)
		{
			//Debug("Bonus!");
			return this.colors[num];
		}
		var r = parseInt(color.slice(1, 3), 16);
		var g = parseInt(color.slice(3, 5), 16);
		var b = parseInt(color.slice(5, 7), 16);

		fCanvas.width = this.base.width;
		fCanvas.height = this.base.height;
		fctx.drawImage(this.base, 0, 0);
		var imgData = fctx.getImageData(0, 0, this.base.width, this.base.height);
		var d = imgData.data;

		var nColor = document.createElement('canvas');
		//this.colors.push(color);
		nColor.width = this.base.width;
		nColor.height = this.base.height;
		var cctx = nColor.getContext('2d');

		for (var i = 0; i < d.length; i+=4)
		{
			if (d[i] != 0)
			{
				d[i] = r;
				d[i+1] = g;
				d[i+2] = b;
			}
		}
		imgData.data = d;
		cctx.putImageData(imgData, 0, 0);
		this.colors[num] = nColor;
		return this.colors[num];
	}

}
/*
function DrawLayer () {
	// tCanvas: Canvas for drawing tiles. "slow" style, only updates on a change
	// Since tiles are limited to 30px by 30px, only the area for a tile needs updating
	this.tCanvas = document.createElement('canvas');
	this.tCanvas.setAttribute("id", "canvas" + z + "t");
	this.tCanvas.width = 30 * AREA_WIDTH;
	this.tCanvas.height = 30 * AREA_HEIGHT;
	// tctx: context for tCanvas
	this.tctx = this.tCanvas.getContext('2d');
	// tDrawOn: boolean indicating if tCanvas should be drawn (any tiles on it)
	this.tDrawOn = true;
	// eCanvas: Canvas for drawing entities, effects, and anything else. "slow" style, only updates on a change
	// effects and entities can go past the tile border so updates mean clear the whole canvas and draw each thing again.
	this.eCanvas = document.createElement('canvas');
	this.eCanvas.setAttribute("id", "canvas" + z + "t");
	this.eCanvas.width = 30 * AREA_WIDTH;
	this.eCanvas.height = 30 * AREA_HEIGHT;
	// ectx: context for eCanvas
	this.ectx = this.eCanvas.getContext('2d');
	// eDrawOn: boolean indicating if eCanvas should be draw (any effects or anything on it)
	this.eDrawOn = true;
	this.eNeedsUpdate = false;
	layerList.push(this);
	this.entities = [];
	this.effects = [];
	this.items = [];
}*/

// Tile types:
var EMPTY = 0;
var WALL = 1;
var FLOOR = 2;
var OTHER = 3;

// Tile constructor function
// A Tile represents a piece of the world.
function Tile (type, tileset, color, x, y) {
	// type: type of tile (EMPTY, WALL, FLOOR, etc)
	this.type = type;
	// tileset: which tileset to use (name of image)
	this.tileset = tileset;
	// color: What color is this tile
	this.color = color;
	// x, y, : Where is this tile located. (Matches up with area[x][y] coordinates)
	this.x = x;
	this.y = y;
	// content: What entities / other stuff are currently in this tile
	// (Array of Entities)
	// (Other things? ***)
	this.entities = [];
	this.effects = [];
	this.items = [];
	// edges: What tiles are accessible from this one? (Used in pathfinding)
	// (Array of Tiles)
	this.edges = [];
	// eDrawn: Indicates if this tile's contents have been drawn already on the e layer
	this.eDrawn = false;
	// 
	this.previousType = type;
	this.previousTileset = tileset;
	this.previousColor = color;
	this.tNumber = -1;
	this.previousTNumber = -1;
}

// PathNode constructor function
// A PathNode is used in pathfinding. (A* algorithm)
function PathNode (tile, dest, cost, parent) {
	// tile: Which tile does this correspond to
	this.tile = tile;
	// cost: Cost so far to move to this tile
	this.cost = cost;
	// parent: Previous node in chain (Used to backtrace to find path)
	this.parent = parent
	// distEst: An estimate of the distance from here to the final destination
	this.distEst = DistanceEstimate(tile, dest);
}

// Entity constructor function
// An Entity is a person or creature in the world
function Entity (name, image, color, x, y) {
	/*if (symbol.length != 1)
	{
		Debug("Entity constructor failed: symbol too long/short");
		return;
	}*/
	if (!ready)
	{
		Debug("Entity constructor failed: not ready!");
		return;
	}
	// name: What is the name of this entity. (Example: "Skeleton")
	this.name = name;
	// image: Which image to display for this entity
	this.image = image;
	// color: What color is this entity
	this.color = color;
	// renderImage: Reference to filteredImage to use
	this.renderImage = null;
	// x, y, z: Current coordinates of this entity. (Area coordinates.)
	// (Also, the content of that tile will have this entity in its content array)
	this.x = x;
	this.y = y;
	// moveDelay: Time (in frames) until this entity can move again
	//this.moveDelay = 6;
	//this.MAX_MOVE_DELAY = 6;
	// fallDelay: Time (in frames) until this entity falls to the next tile below it
	//this.fallDelay = 4;
	//this.MAX_FALL_DELAY = 4;
	// fallspeed: higher means faster falling
	//this.fallSpeed = 0;
	// destX, destY, : Used for pathfinding, which tile is the entity moving to
	this.destX = x;
	this.destY = y;
	// path: Series of tiles for this entity to move to in order to reach destination tile
	// (Array of Tiles)
	this.path = [];
	// foundPath: Path was found. (If false, do something else)
	this.foundPath = false;
	// moveX, moveY, moveZ: How far to move the next time the entity is ready.
	// (-1, 0, or 1 for each, at most)
	this.moveX = 0;
	this.moveY = 0;
	//this.moveZ = 0;
	// Update relevant data arrays
	area[x][y].entities.push(this);
	entityList.push(this);
	// GetTile(): Returns the tile this entity is currently in
	this.GetTile = function () {
		return area[this.x][this.y];
	};
	// inMesgQueue: Messages that this entity has recieved, but hasn't acted on yet
	// (Array of Messages)
	this.inMesgQueue = [];
	// outMesgQueue: Messages that this entity will "say", but hasn't yet.
	// (Array of strings, will be converted to Messages)
	this.outMesgQueue = [];
	// respondDelay: Time in frames before this entity says the next thing in their outMesgQueue
	// (Simulates typing time)
	this.MAX_RESPOND_DELAY = 20;
	this.respondDelay = this.MAX_RESPOND_DELAY;
	this.HP = 10;
	this.MAX_HP = 10;
	this.MP = 0;
	this.MAX_MP = 0;
	//this.STAMINA = 100;
	// events: list of events (functions) to call every frame
	// Only the event at the start of the list is called. If it returns true, remove it
	//this.events = [];
	// timer: used for events and such
	//this.timer = 0;
	if (renderReady)
	{
		DrawTileContent(this.GetTile());
	}
}


// Item types:
//var COLLECT = 1;
//var FALL = 2;
//var SWITCH_A = 3;
//var SWITCH_B = 4;

// Item: Something for the player collect or interact with
// Uses the images in the Effect folder
function Item (type, image, color, x, y)
{
	if (!CheckBounds(0, AREA_SIZE - 1, [x, y]))
	{
		return;
	}
	this.type = type;
	this.image = image;
	this.color = color;
	this.x = x;
	this.y = y;
	//this.z = z;
	//area[x][y];
	//this.screenX = x * 30 - 4;
	//this.screenY = y * 30 + 30 - 21;

	//this.lctx = layerList[z].ectx;
	
	area[x][y].items.push(this);
	itemList.push(this);
	this.GetTile = function () {
		return area[this.x][this.y];
	};
	//layerList[z].items.push(this);
	//layerList[z].eNeedsUpdate = true;
	//layerList[z].eDrawOn = true;
	if (renderReady)
	{
		DrawTileContent(this.GetTile());
	}
}

function RemoveItem (item) {
	var tile = item.GetTile();
	tile.items.splice(tile.items.indexOf(item), 1);
	itemList.splice(itemList.indexOf(item), 1);
	DrawTileContent(tile);
}


// for decorative effects that the player doesn't interact with
// NEEDS FIXITUPS? OR IS IT OKAY NOW
function Effect (imageList, delay, color, x, y)
{
	/*
	if (Math.abs(x - cameraX) > 12 || Math.abs(y - cameraY) > 12)
	{
		if (Math.abs(x - player.x) > 12 || Math.abs(y - player.y) > 12)
		{
			//Too far away too see, skip doing anything
			return;
		}
	}*/
	if (!CheckBounds(0, AREA_SIZE - 1, [x, y]))
	{
		return;
	}
	this.color = color;
	this.imageList = imageList;
	this.x = x;
	this.y = y;

	this.delay = delay;
	this.MAX_DELAY = delay;
	
	
	area[x][y].effects.push(this);
	effectList.push(this);
	this.GetTile = function () {
		return area[this.x][this.y];
	};
	//layerList[z].effects.push(this);
	//layerList[z].eNeedsUpdate = true;
	//layerList[z].eDrawOn = true;
	if (renderReady)
	{
		DrawTileContent(this.GetTile());
	}
}

// Message constructor function
// Used to display text boxes 
function Message (text, entity)
{
	if (text.length == 0)
	{
		Debug("Message constructor failed: text too short");
		return;
	}
	if (!ready)
	{
		Debug("Message constructor failed: not ready!");
		return;
	}
	// text: the content of the message
	this.text = text;
	// entity: the entity associated with this message (who said it)
	this.entity = entity;
	// fade: time (frames) until gone. (Decremented)
	// (0 through -50 are partially transparent. after that, it is removed from the messages array)
	this.fade = 200;
	// x, y, boxWidth, boxHeight: display position and size of the textbox
	// (x and y do smooth-ish movement to targetX and targetY)
	this.x = EntityScreenX(entity) + 8;
	this.y = EntityScreenY(entity) - 0;
	this.boxWidth = text.length * 10 + 6;
	this.boxHeight = 16;
	// color: What color is the text & textbox. (based on entity's color)
	this.color = entity.color;
	// This section: add the message to the messages array, while maintaining the promptMessage's position.
	var prompt = messages.pop();
	messages.push(this);
	if (prompt)
	{
		messages.push(prompt);
	}
	// Functions for determining update positions
	this.FixPosX = function () {
		this.targetX = EntityScreenX(entity) + 8;
	};
	this.FixPosY = function () {
		this.targetY = EntityScreenY(entity) - 0;
	};
	// targetX, targetY: "real" screen positions
	this.targetX = this.x;
	this.targetY = this.y;
	// send message to all entities
	for (var i = 0; i < entityList.length; i++)
	{
		var toEntity = entityList[i];
		if (toEntity != entity)
		{
			toEntity.inMesgQueue.push(this);
		}
	}
	this.glow = false;
	this.glowColor = "#000000";
}

// Fills the area array with tiles, and does basic map-making.
// Then, calls SetUpConnections() on each tile
function SetUpArea () {
	var i;
	var j;
	var k;
	for (i = 0; i < AREA_WIDTH; i++)
	{
		area.push(new Array());
		
		for (j = 0; j < AREA_HEIGHT; j++)
		{
			area[i].push(new Tile(EMPTY, "", "#000000", i, j));
		}
	}

	SetByRect(0, 0, 34, 34, WALL, "double", "#404040");
	var randX = 0;
	var randY = 0;
	var l = 0;
	//Wall sections
	for (k = 0; k < 110; k++)
	{
		randX = Math.floor(Math.random() * 33 + 1);
		randY = Math.floor(Math.random() * 33 + 1);
		SetTile(randX, randY, WALL, "double", "#404040");
		for (l = 0 - Math.random() * 3; l < 5; l++)
		{
			if (Math.random() > 0.5) randX = (Math.random() > 0.5) ? randX + 1 : randX - 1; else randY = (Math.random() > 0.5) ? randY + 1 : randY - 1;
			SetTile(randX, randY, WALL, "double", "#404040");
		}
	}
	//Wall sections near corners
	for (k = 0; k < 15; k++)
	{
		randX = 1;
		randY = 1;
		SetTile(randX, randY, WALL, "double", "#404040");
		for (l = 0 - Math.random() * 3; l < 5; l++)
		{
			if (Math.random() > 0.5) randX = (Math.random() > 0.5) ? randX + 1 : randX - 1; else randY = (Math.random() > 0.5) ? randY + 1 : randY - 1;
			SetTile(randX, randY, WALL, "double", "#404040");
		}
		randX = 33;
		randY = 1;
		SetTile(randX, randY, WALL, "double", "#404040");
		for (l = 0 - Math.random() * 3; l < 5; l++)
		{
			if (Math.random() > 0.5) randX = (Math.random() > 0.5) ? randX + 1 : randX - 1; else randY = (Math.random() > 0.5) ? randY + 1 : randY - 1;
			SetTile(randX, randY, WALL, "double", "#404040");
		}
		randX = 33;
		randY = 33;
		SetTile(randX, randY, WALL, "double", "#404040");
		for (l = 0 - Math.random() * 3; l < 5; l++)
		{
			if (Math.random() > 0.5) randX = (Math.random() > 0.5) ? randX + 1 : randX - 1; else randY = (Math.random() > 0.5) ? randY + 1 : randY - 1;
			SetTile(randX, randY, WALL, "double", "#404040");
		}
		randX = 1;
		randY = 33;
		SetTile(randX, randY, WALL, "double", "#404040");
		for (l = 0 - Math.random() * 3; l < 5; l++)
		{
			if (Math.random() > 0.5) randX = (Math.random() > 0.5) ? randX + 1 : randX - 1; else randY = (Math.random() > 0.5) ? randY + 1 : randY - 1;
			SetTile(randX, randY, WALL, "double", "#404040");
		}
	}

	//Rooms (4x4) and hallways (5x1 / 1x5)
	for (k = 0; k < 10; k++)
	{
		randX = Math.floor(Math.random() * 29 + 1);
		randY = Math.floor(Math.random() * 29 + 1);
		SetBySize(randX, randY, 4, 4, EMPTY, "", "#000000");

		randX = Math.floor(Math.random() * 28 + 1);
		randY = Math.floor(Math.random() * 32 + 1);
		SetBySize(randX, randY, 5, 1, EMPTY, "", "#000000");

		randX = Math.floor(Math.random() * 32 + 1);
		randY = Math.floor(Math.random() * 28 + 1);
		SetBySize(randX, randY, 1, 5, EMPTY, "", "#000000");
	}
	//Center Room
	SetByXY(15, 15, 19, 19, EMPTY, "", "#000000");
	//Empty to Floor, flooding out from center
	FloodFill(17, 17, 0);

	//Empty to Wall 
	for (i = 0; i < AREA_WIDTH; i++)
	{
		for (j = 0; j < AREA_HEIGHT; j++)
		{
			FloodFillB(i, j);
		}
	}
	//Wall to Empty
	for (i = 0; i < AREA_WIDTH; i++)
	{
		for (j = 0; j < AREA_HEIGHT; j++)
		{
			FloodFillC(i, j);
		}
	}
	//Pathfinding
	SetUpAllConnections();
}

function SetUpAllConnections () {
	//return; //Pathfinding
	for (var i = 0; i < AREA_WIDTH; i++)
	{
		for (var j = 0; j < AREA_HEIGHT; j++)
		{
			SetUpConnections(area[i][j]);
		}
	}
}

// Creates a set of edges (connections) to surrounding tiles, for pathfinding
function SetUpConnections (tile) {
	//return; //Pathfinding
	if (tile.edges.length != 0)
	{
		Debug("SetUpConnections failed: Connections already set up");
		return;
	}
	var tx = tile.x;
	var ty = tile.y;
	if (tile.type != FLOOR)
	{
		return;
	}

	// 4 Directions
	EdgeTry(tile, 0, -1);
	EdgeTry(tile, 1, 0);
	EdgeTry(tile, 0, 1);
	EdgeTry(tile, -1, 0);
}

// Try a direction (one of 8) from a tile and return the destination. (null if doesn't work)
function EdgeTry (tile, x, y) {

	var tx = tile.x;
	var ty = tile.y;
	if (area[tx + x][ty + y].type == FLOOR)
	{
		tile.edges.push(area[tx + x][ty + y]);
	}
}

// Determine distance between two tiles.
// (Currently only does x distance + y distance)
function DistanceEstimate (tile1, tile2) {
	var xyDist = Math.abs(tile1.x - tile2.x) + Math.abs(tile1.y - tile2.y);
	return xyDist;
}

var player;

// Make a bunch of entities.
// Also, create promptMessage.
function SetUpEntities () {
	
	player = new Entity("Player", "player", "#00FFFF", 17, 17);
	cameraX = player.x + 0.5;
	cameraY = player.y + 0.5;
	//cameraZ = player.z;
	targetX = player.x + 0.5;
	targetY = player.y + 0.5;
	//targetZ = player.z;
	promptMessage = new Message(">_", player);

	//new Entity("Skeleton", "A", "#FFFFFF", 5, 13, 18)
	//new Entity("FireElemental", "B", "#FF0000", 2, 3, 15);
	//new Entity("GelatinousCube", "C", "#88FF88", 18, 9, 19);
	//new Entity("Snake", "D", "#00FF00", 15, 4, 19);
}

function ChangeLevel (num) {
	newLevel = true;
	levelNum = num;
}

// Looks like sparks around an entity that match its color
/*
function LightningAroundEntity (entity) {
	new Effect(["lightning1", "lightning2", "lightning3", "lightning2", "lightning1"], 3, entity.color, entity.x, entity.y - 1);
	new Effect(["lightning1", "lightning2", "lightning3", "lightning2", "lightning1"], 3, entity.color, entity.x, entity.y + 1);
	new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, entity.color, entity.x - 1, entity.y);
	new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, entity.color, entity.x + 1, entity.y);
}*/

/*
function ItemsByXY (startX, startY, endX, endY, type, image, color) {
	if (!CheckBounds(0, AREA_SIZE - 1, [startX, startY, endX, endY]))
	{
		Debug("Items By XYZ() Failed: limits");
		return;
	}
	if (GetEffectImage(image) == -1)
	{
		Debug("invalid effect image file! tried " + image);
		return;
	}
	if (startX > endX)
	{
		startX = -(endX = (startX += endX) - endX) + startX;
	}
	if (startY > endY)
	{
		startY = -(endY = (startY += endY) - endY) + startY;
	}
	for (var i = startX; i <= endX; i++)
	{
		for (var j = startY; j <= endY; j++)
		{
			new Item(type, image, color, i, j);
		}
	}
}
*/

// Set one specific tile with a solidity, symbol, and color
function SetTile (X, Y, type, tileset, color) {
	if (!CheckBounds(0, AREA_SIZE - 1, [X, Y]))
	{
		Debug("SetTile() Failed: limits");
		return;
	}
	/*if (symbol.length != 1)
	{
		Debug("SetTile() Failed: symbol too long/short");
		return;
	}*/
	var curTile = area[X][Y];
	curTile.type = type;
	curTile.tileset = tileset;
	curTile.color = color;
	if (renderReady)
	{
		RenderTile(curTile);
	}
	if (renderReady)
	{
		//ResetConnectionsXYZ(X, Y, Z, X, Y, Z);
	}
	
}

// Currently only works EMPTY -> "simple" "#FFFFFF" FLOOR
// Only works pre- renderReady because reasons (lazy)
function FloodFill (X, Y) {
	if (!CheckBounds(0, AREA_SIZE - 1, [X, Y]))
	{
		return;
	}
	var curTile = area[X][Y];
	if (curTile.type == EMPTY)
	{
		curTile.type = FLOOR;
		curTile.tileset = "simple";
		curTile.color = "#FFFFFF";
		FloodFill(X, Y-1);
		FloodFill(X+1, Y);
		FloodFill(X, Y+1);
		FloodFill(X-1, Y);
	}
}

// EMPTY -> WALL
function FloodFillB (X, Y) {
	if (!CheckBounds(0, AREA_SIZE - 1, [X, Y]))
	{
		return;
	}
	var curTile = area[X][Y];
	if (curTile.type == EMPTY)
	{
		curTile.type = WALL;
		curTile.tileset = "double";
		curTile.color = "#404040";
		/*FloodFillB(X, Y-1);
		FloodFillB(X+1, Y);
		FloodFillB(X, Y+1);
		FloodFillB(X-1, Y);*/
	}
}

//Okay so this one trys a tile...
// If not a WALL tile, return.
// If any surrounding 4 tiles are FLOOR, return.
// Otherwise: Turn into EMPTY tile, and FloodFillB surrounding tiles
//Purpose is to clear out necessary WALL tiles
function FloodFillC (X, Y) {
	if (!CheckBounds(0, AREA_SIZE - 1, [X, Y]))
	{
		return;
	}
	var curTile = area[X][Y];
	if (curTile.type == WALL)
	{
		if (GetTypeFromXY(X, Y-1) != FLOOR && GetTypeFromXY(X+1, Y-1) != FLOOR && GetTypeFromXY(X+1, Y) != FLOOR && GetTypeFromXY(X+1, Y+1) != FLOOR &&
			GetTypeFromXY(X, Y+1) != FLOOR && GetTypeFromXY(X-1, Y+1) != FLOOR && GetTypeFromXY(X-1, Y) != FLOOR && GetTypeFromXY(X-1, Y-1) != FLOOR)
			{
				curTile.type = EMPTY;
				curTile.tileset = "";
				curTile.color = "#000000";
				/*FloodFillC(X, Y-1);
				FloodFillC(X+1, Y);
				FloodFillC(X, Y+1);
				FloodFillC(X-1, Y);*/
			}
		
	}
}

// Set a diagonal section
/*function SetStairs (startX, startY, startZ, chX, chY, chZ, length, type, tileset, color) {
	if (!CheckBounds(0, AREA_SIZE - 1, [startX, startY, startZ, startX + chX * length, startY + chY * length, startZ + chZ * length]))
	{
		Debug("SetStairs() Failed: limits");
		return;
	}
	if (symbol.length != 1)
	{
		Debug("SetStairs() Failed: symbol too long/short");
		return;
	}
	for (var i = 0; i < length; i++)
	{
		var curTile = area[startX + i * chX][startY + i * chY][startZ + i * chZ]
		curTile.type = type;
		curTile.tileset = tileset;
		curTile.color = color;
		if (renderReady)
		{
			RenderTile(curTile);
		}
	}
	if (renderReady)
	{
		ResetConnectionsXYZ(startX, startY, startZ, startX + chX * length, startY + chY * length, startZ + chZ * length);
	}
	
}*/

// Set an area. X, Y, Z coordinates - box to opposite corner coordinates
// (Inclusive)
function SetByXY (startX, startY, endX, endY, type, tileset, color) {
	if (!CheckBounds(0, AREA_SIZE - 1, [startX, startY, endX, endY]))
	{
		Debug("SetByXYZ() Failed: limits");
		return;
	}
	if (type == FLOOR && GetFloorImage(tileset) == -1)
	{
		Debug("invalid floor tileset! tried " + tileset);
		return;
	}
	if (type == WALL && GetWallImage(tileset) == -1)
	{
		Debug("invalid wall tileset! tried " + tileset);
		return;
	}
	if (type == OTHER && GetOtherImage(tileset) == -1)
	{
		Debug("invalid other tileset! tried " + tileset);
		return;
	}
	/*if (symbol.length != 1)
	{
		Debug("SetByXYZ() Failed: symbol too long/short");
		return;
	}*/
	if (startX > endX)
	{
		startX = -(endX = (startX += endX) - endX) + startX;
	}
	if (startY > endY)
	{
		startY = -(endY = (startY += endY) - endY) + startY;
	}
	for (var i = startX; i <= endX; i++)
	{
		for (var j = startY; j <= endY; j++)
		{
			var curTile = area[i][j];
			curTile.type = type;
			curTile.tileset = tileset;
			curTile.color = color;
			if (renderReady)
			{
				RenderTile(curTile);
			}
		}
	}
	if (renderReady)
	{
		//ResetConnectionsXYZ(startX, startY, startZ, endX, endY, endZ);
	}
}

// Set an area. X, Y, Z coordinates and width, height, depth values
function SetBySize (startX, startY, width, height, type, tileset, color) {
	if (!CheckBounds(0, AREA_SIZE - 1, [startX, startY, startX + width - 1, startY + height - 1]))
	{
		Debug("SetBySize() Failed: limits");
		return;
	}
	/*if (symbol.length != 1)
	{
		Debug("SetBySize() Failed: symbol too long/short");
		return;
	}*/
	for (var i = startX; i < startX + width; i++)
	{
		for (var j = startY; j < startY + height; j++)
		{
			var curTile = area[i][j];
			curTile.type = type;
			curTile.tileset = tileset;
			curTile.color = color;
			if (renderReady)
			{
				RenderTile(curTile);
			}
		}
	}
	if (renderReady)
	{
		//ResetConnectionsXYZ(startX, startY, startZ, startX + width, startY + height, startY + depth);
	}
	
}

// Set an area. X, Y, Z coordinates - box to opposite corner coordinates
// (Inclusive)
// Only sets the outside edge of tiles: hollow box (but not top or bottom)
function SetByRect (startX, startY, endX, endY, type, tileset, color) {
	if (!CheckBounds(0, AREA_SIZE - 1, [startX, startY, endX, endY]))
	{
		Debug("SetByXYZ() Failed: limits");
		return;
	}
	/*if (symbol.length != 1)
	{
		Debug("SetByXYZ() Failed: symbol too long/short");
		return;
	}*/
	if (startX > endX)
	{
		startX = -(endX = (startX += endX) - endX) + startX;
	}
	if (startY > endY)
	{
		startY = -(endY = (startY += endY) - endY) + startY;
	}
	for (var i = startX; i <= endX; i++)
	{
		for (var j = startY; j <= endY; j++)
		{
			if (i == startX || i == endX || j == startY || j == endY)
			{
				var curTile = area[i][j];
				curTile.type = type;
				curTile.tileset = tileset;
				curTile.color = color;
				if (renderReady)
				{
					RenderTile(curTile);
				}
			}
		}
	}
	if (renderReady)
	{
		//ResetConnectionsXYZ(startX, startY, startZ, endX, endY, endZ);
	}
	
}

// Does it with 1 tile buffer around entire thing, and starting at the very top of the area
// (startZ is ignored, but I kept it in for no good reason)
function ResetConnectionsXYZ(startX, startY, startZ, endX, endY, endZ) {
	//ALSO: not 3d
	return; //Pathfinding
	if (startX > endX)
	{
		startX = -(endX = (startX += endX) - endX) + startX;
	}
	if (startY > endY)
	{
		startY = -(endY = (startY += endY) - endY) + startY;
	}
	if (startZ > endZ)
	{
		startZ = -(endZ = (startZ += endZ) - endZ) + startZ;
	}
	for (var i = startX - 1; i <= endX + 1; i++)
	{
		if (i >= 0 && i <= AREA_WIDTH - 1)
		{
			for (var j = startY - 1; j <= endY + 1; j++)
			{
				if (j >= 0 && j <= AREA_HEIGHT - 1)
				{
					for (var k = 0; k <= endZ + 1; k++)
					{
						if (k >= 0 && k <= AREA_DEPTH - 1)
						{
							area[i][j][k].edges.length = 0;
							SetUpConnections(area[i][j][k]);
						}
					}
				}
			}
		}
	}
}


// Test if all of an array of numbers are within a range
// Inclusive is okay (4 is within the bounds of 4 to 8)
// True if within the limits
function CheckBounds (botLimit, topLimit, testArray) {
	for (var i = 0; i < testArray.length; i ++)
	{
		if (testArray[i] < botLimit || testArray[i] > topLimit)
		{
			return false;
		}
	}
	return true;
}

// Test if a color is valid for use.
// ( "#123456" format)
function ColorValid (color) {
	//I didn't make this
	//http://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
	var test = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
	if (test)
	{
		return true;
	}
	return false;
}

// Set up the canvas layer for each Z layer
function SetUpRender () {
	for (var im = 0; im < imageSources.length; im ++)
	{
		new FilteredImage(imageSources[im]);
	}
	for (var i = 0; i < AREA_WIDTH; i++)
	{
		for (var j = 0; j < AREA_HEIGHT; j++)
		{
			var tile = area[i][j];
			/*if (tile.color != color)
			{
				color = tile.color;
				newCtx.fillStyle = color;
			}*/
			tile.previousType = tile.type;
			GetTileNumber(tile);
			if (tile.type == FLOOR)
			{
				tctx.drawImage(filteredImages[GetFloorImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
			}
			else if (tile.type == WALL)
			{
				tctx.drawImage(filteredImages[GetWallImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
			}
			else if (tile.type == OTHER)
			{
				tctx.drawImage(filteredImages[GetOtherImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
			}
			tile.previousTNumber = tile.tNumber;
			tile.previousType = tile.type;
			tile.previousTileset = tile.tileset;
			tile.previousColor = tile.color;
		}
	}
	RenderLayerE();
	renderReady = true;
}

// Clears then re-draws the tile on the correct canvas layer
function RenderTile (tile) {
	if (!tile)
	{
		return;
	}
	//ClearTile(tile);
	DrawTile(tile);
}

function RenderAdjacentTiles (tile) {
	if (tile.y > 0)
	{
		RenderTile(area[tile.x][tile.y-1]);
	}
	if (tile.y < AREA_HEIGHT - 1)
	{
		RenderTile(area[tile.x][tile.y+1]);
	}
	if (tile.x > 0)
	{
		RenderTile(area[tile.x-1][tile.y]);
		if (tile.y > 0)
		{
			RenderTile(area[tile.x-1][tile.y-1]);
		}
		if (tile.y < AREA_HEIGHT - 1)
		{
			RenderTile(area[tile.x-1][tile.y+1]);
		}
	}
	if (tile.x < AREA_WIDTH - 1)
	{
		RenderTile(area[tile.x+1][tile.y]);
		if (tile.y > 0)
		{
			RenderTile(area[tile.x+1][tile.y-1]);
		}
		if (tile.y < AREA_HEIGHT - 1)
		{
			RenderTile(area[tile.x+1][tile.y+1]);
		}
	}
}

// Erases the tile's rendering on it's canvas layer
function ClearTile (tile) {
	if (!tile)
	{
		return;
	}
	tctx.clearRect(tile.x * 30, tile.y * 30, 30, 30);
}

// Draws the tile on its corresponding canvas layer
function DrawTile (tile) {
	//Debug("test");
	if (!tile)
	{
		return;
	}
	GetTileNumber(tile);
	if (tile.tNumber != tile.previousTNumber || tile.type != tile.previousType || tile.tileset != tile.previousTileset || tile.color != tile.previousColor)
	{
		ClearTile(tile);
		if (tile.type == FLOOR)
		{
			tctx.drawImage(filteredImages[GetFloorImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
		}
		else if (tile.type == WALL)
		{
			tctx.drawImage(filteredImages[GetWallImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
		}
		else if (tile.type == OTHER)
		{
			tctx.drawImage(filteredImages[GetOtherImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
		}
		if (tile.previousType != tile.type)
		{
			RenderAdjacentTiles(tile);
		}
		tile.previousTNumber = tile.tNumber;
		tile.previousType = tile.type;
		tile.previousTileset = tile.tileset;
		tile.previousColor = tile.color;
	}
	return;
}

// Draws all entitites, items, and effects on this tile
function DrawTileContent (tile)
{
	ectx.clearRect(30 * tile.x, 30 * tile.y, 30, 30);

	if (tile.items.length != 0)
	{
		for (var c = 0; c < tile.items.length; c ++)
		{
			var xDraw = 30 * tile.x;
			var yDraw = 30 * tile.y;
			var item = tile.items[c];
			ectx.drawImage(filteredImages[GetEffectImage(item.image)].GetColor(item.color), 0, 0, 30, 30, xDraw, yDraw, 30, 30);
		}
	}
	if (tile.entities.length != 0)
	{
		for (var c = 0; c < tile.entities.length; c ++)
		{
			var xDraw = 30 * tile.x;
			var yDraw = 30 * tile.y;
			var entity = tile.entities[c];
			ectx.drawImage(filteredImages[GetEntityImage(entity.image)].GetColor(entity.color), 0, 0, 30, 30, xDraw, yDraw, 30, 30);
		}
	}
	if (tile.effects.length != 0)
	{
		for (var c = 0; c < tile.effects.length; c ++)
		{
			var effect = tile.effects[c];
			ectx.drawImage(filteredImages[GetEffectImage(effect.imageList[0])].GetColor(effect.color), 0, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
		}
	}
}

function RenderLayerE ()
{
	//return; //Can't deal with this now

	//var turnLayerOff = true;
	// Draw stuff
	for (var i = 0; i < entityList.length; i++)
	{
		DrawTileContent(entityList[i].GetTile());
		//turnLayerOff = false;
	}
	for (var i = 0; i < effectList.length; i++)
	{
		DrawTileContent(effectList[i].GetTile());
		//turnLayerOff = false;
	}
	for (var i = 0; i < itemList.length; i++)
	{
		DrawTileContent(itemList[i].GetTile());
		//turnLayerOff = false;
	}
	//if (turnLayerOff)
	//{
	//	drawLayer.eDrawOn = false;
	//}
	// Reset flags
	/*for (var i = 0; i < drawLayer.entities.length; i++)
	{
		drawLayer.entities[i].GetTile().eDrawn = false;
	}
	for (var i = 0; i < drawLayer.effects.length; i++)
	{
		drawLayer.effects[i].GetTile().eDrawn = false;
	}
	for (var i = 0; i < drawLayer.items.length; i++)
	{
		drawLayer.items[i].GetTile().eDrawn = false;
	}*/
}

// Clears from memory:
// - all tiles except bottom layer,
//   - all tile content: entities, items, effects
// - all entities (player needs to be re-inserted)
// - all effects
// - all items
// - all messages
// - all information for entities, items, effects, from layerList
/*
function ResetLevel () {
	var i = 0;
	var j = 0;
	var k = 0;
	for (i = 0; i < AREA_WIDTH; i++)
	{
		for (j = 0; j < AREA_HEIGHT; j++)
		{
			// Skip bottom layer
			for (k = 0; k < AREA_DEPTH - 1; k++)
			{
				var tile = area[i][j][k];
				tile.type = EMPTY;
				tile.previousType = EMPTY;
				//tile.tileset = tileset; //unnecessary
				//tile.color = color; //unnecessary
				//tile.edges.length = 0; //Pathfinding
				tile.effects.length = 0;
				tile.entities.length = 0;
				tile.items.length = 0;
			}
			// do some of the things to bottom layer
			var bTile = area[i][j][AREA_DEPTH - 1];
			//bTile.edges.length = 0; //Pathfinding
			bTile.effects.length = 0;
			bTile.entities.length = 0;
			bTile.items.length = 0;
		}
	}
	entityList.length = 0;
	effectList.length = 0;
	itemList.length = 0;
	messages.length = 0;
	for (i = 0; i < layerList.length; i++)
	{
		var drawLayer = layerList[i];
		drawLayer.eDrawOn = false;
		drawLayer.eNeedsUpdate = true;
		drawLayer.effects.length = 0;
		drawLayer.entities.length = 0;
		drawLayer.items.length = 0;
		drawLayer.tctx.clearRect(0, 0, 1050, 1050)
	}

	switchModeA = true;
}*/

// Set up levels based on number
// re-insert player entity
/*
function StartLevel (nLevel) {
	newLevel = false;
	renderReady = false;
	ResetLevel();
	switch (nLevel)
	{
		case 1: // Center A
		// Floor
		SetByXYZ(15, 0, 20, 19, 34, 20, FLOOR, "concentric", "#FFFFFF");
		SetByXYZ(0, 15, 20, 34, 19, 20, FLOOR, "concentric", "#FFFFFF");
		SetByRect(9, 9, 20, 25, 25, 20, FLOOR, "solid", "#FFFFFF");
		SetByXYZ(15, 17, 20, 19, 17, 20, FLOOR, "solid", "#FFFFFF");
		SetByXYZ(17, 15, 20, 17, 19, 20, FLOOR, "solid", "#FFFFFF");
		// Above
		SetByXYZ(17, 9, 10, 17, 25, 10, WALL, "full", "#FFFFFF");
		SetByXYZ(9, 17, 10, 25, 17, 10, WALL, "full", "#FFFFFF");
		SetByRect(15, 15, 10, 19, 19, 10, WALL, "full", "#FFFFFF");
		SetByXYZ(16, 16, 10, 18, 18, 10, EMPTY, "", "#000000");
		// Below
		SetByXYZ(17, 9, 30, 17, 25, 30, WALL, "full", "#FFFFFF");
		SetByXYZ(9, 17, 30, 25, 17, 30, WALL, "full", "#FFFFFF");
		SetByRect(15, 15, 30, 19, 19, 30, WALL, "full", "#FFFFFF");
		SetByXYZ(16, 16, 30, 18, 18, 30, EMPTY, "", "#000000");

		player = new Entity("Player", "player", "#00FFFF", 17, 17, 0);

		var recover = new Entity("Recover", "A", "#010101", 34, 34, 34);
		recover.events.push(function () {
			recover.timer ++;
			if (recover.timer >= 12 - 1)
			{
				if (player.x <= 14)
				{
					new Effect(["lightning1", "lightning2", "lightning3", "lightning2"], 3, "#FFFFFF", 0, 15, 20);
					new Effect(["lightning2", "lightning3", "lightning2", "lightning1"], 3, "#FFFFFF", 0, 16, 20);
					new Effect(["lightning3", "lightning2", "lightning1", "lightning2"], 3, "#FFFFFF", 0, 17, 20);
					new Effect(["lightning2", "lightning1", "lightning2", "lightning3"], 3, "#FFFFFF", 0, 18, 20);
					new Effect(["lightning1", "lightning2", "lightning3", "lightning2"], 3, "#FFFFFF", 0, 19, 20);
				}
				if (player.x >= 20)
				{
					new Effect(["lightning1", "lightning2", "lightning3", "lightning2"], 3, "#FFFFFF", 34, 15, 20);
					new Effect(["lightning2", "lightning3", "lightning2", "lightning1"], 3, "#FFFFFF", 34, 16, 20);
					new Effect(["lightning3", "lightning2", "lightning1", "lightning2"], 3, "#FFFFFF", 34, 17, 20);
					new Effect(["lightning2", "lightning1", "lightning2", "lightning3"], 3, "#FFFFFF", 34, 18, 20);
					new Effect(["lightning1", "lightning2", "lightning3", "lightning2"], 3, "#FFFFFF", 34, 19, 20);
				}
				if (player.y <= 14)
				{
					new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2"], 3, "#FFFFFF", 15, 0, 20);
					new Effect(["lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, "#FFFFFF", 16, 0, 20);
					new Effect(["lightningR3", "lightningR2", "lightningR1", "lightningR2"], 3, "#FFFFFF", 17, 0, 20);
					new Effect(["lightningR2", "lightningR1", "lightningR2", "lightningR3"], 3, "#FFFFFF", 18, 0, 20);
					new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2"], 3, "#FFFFFF", 19, 0, 20);
				}
				if (player.y >= 20)
				{
					new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2"], 3, "#FFFFFF", 15, 34, 20);
					new Effect(["lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, "#FFFFFF", 16, 34, 20);
					new Effect(["lightningR3", "lightningR2", "lightningR1", "lightningR2"], 3, "#FFFFFF", 17, 34, 20);
					new Effect(["lightningR2", "lightningR1", "lightningR2", "lightningR3"], 3, "#FFFFFF", 18, 34, 20);
					new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2"], 3, "#FFFFFF", 19, 34, 20);
				}
				RandomRain();
				recover.timer = 0;
			}
			if (player.z == 34)
			{
				ChangePosition(player, 17, 17, 20);
				LightningAroundEntity(player);
			}
			if (player.y == 0)
			{
				ChangeLevel(2);
			}
			if (player.x == 34)
			{
				ChangeLevel(3);
			}
			if (player.y == 34)
			{
				ChangeLevel(4);
			}
			if (player.x == 0)
			{
				ChangeLevel(5);
			}
			return false;
		});
		var testBlock = new Entity("Block", "B", "#FFFF00", 18, 18, 10);
		testBlock.events.push(function () {
			if (player.x == testBlock.x && player.y == testBlock.y && player.z == testBlock.z)
			{
				ChangePosition(testBlock, 2 * testBlock.x - testBlock.rpX, 2 * testBlock.y - testBlock.rpY, testBlock.z);
			}
			testBlock.rpX = player.x;
			testBlock.rpY = player.y;
			testBlock.rpZ = player.z;
			return false;
		});
		break;
		case 2: // North A - Focus on "SWITCH"
		SetByXYZ(16, 28, 15, 18, 34, 15, FLOOR, "simple", "#FFFFFF");
		SwitchAByXYZ(17, 26, 15, 17, 27, 15);
		SetTile(17, 25, 15, FLOOR, "simple", "#FFFFFF");
		SwitchAByXYZ(17, 23, 15, 17, 24, 15);
		SetByXYZ(17, 21, 15, 20, 22, 15, FLOOR, "simple", "#FFFFFF");
		SwitchBByXYZ(20, 23, 15, 20, 24, 15);
		SwitchBByXYZ(18, 25, 15, 20, 25, 15);
		SwitchBByXYZ(14, 25, 15, 16, 25, 15);
		SwitchBByXYZ(14, 23, 15, 14, 24, 15);
		SetByXYZ(11, 21, 15, 14, 22, 15, FLOOR, "simple", "#FFFFFF");



		player = new Entity("Player", "player", "#00FFFF", 17, 32, 0);

		var block1 = new Entity("block1", "B", "#FFFFFF", 0, 0, 30);
		SetTile(0, 0, 33, "FLOOR", "simple", "#000000");

		var swGuide = new Entity("swGuide", "A", "#FFFFFF", 19, 21, 15);
		swGuide.events.push(function () {
			if (player.y <= 22)
			{
				swGuide.outMesgQueue.push("hello", "try using SWITCH")
				return true;
			}
			return false;
		}, function () {
			if (swGuide.inMesgQueue.length != 0)
			{
				if (swGuide.inMesgQueue[0].text == "SWITCH")
				{
					swGuide.outMesgQueue.push("cool");
					return true;
				}
				else if (swGuide.inMesgQueue[0].text == "switch" || swGuide.inMesgQueue[0].text == "Switch")
				{
					swGuide.outMesgQueue.push("it needs to be ALL CAPS to work");
				}
				else
				{
					swGuide.outMesgQueue.push("nope");
				}
			}
			return false;
		}, function () {
			if (player.x <= 14 && player.y <= 22)
			{
				SwitchAByXYZ(10, 21, 14, 10, 22, 14);
				SwitchAByXYZ(9, 21, 13, 9, 22, 13);
				SwitchAByXYZ(7, 21, 12, 8, 22, 12);
				SwitchAByXYZ(7, 20, 11, 8, 20, 11);
				SwitchAByXYZ(7, 19, 10, 8, 19, 10);
				SwitchAByXYZ(7, 17, 9, 8, 18, 9);
				SwitchAByXYZ(9, 17, 8, 9, 18, 8);
				SwitchAByXYZ(10, 17, 7, 10, 18, 7);
				SetByXYZ(11, 17, 6, 12, 18, 6, FLOOR, "simple", "#FFFFFF");
				SwitchBByXYZ(13, 17, 15, 14, 18, 15);
				SetByXYZ(15, 17, 15, 20, 18, 15, FLOOR, "simple", "#FFFFFF");
				SetByXYZ(19, 13, 15, 20, 18, 15, FLOOR, "simple", "#FFFFFF");
				return true;
			}
			return false;
		}, function () {
			if (player.x >= 15 && player.y <= 18)
			{
				swGuide.outMesgQueue.push("press 1 to quicksay SWITCH");
				SetByRect(18, 10, 13, 21, 12, 21, WALL, "pattern", "#FFFFFF");
				SetByXYZ(19, 12, 13, 20, 12, 21, EMPTY, "", "#000000");
				SetByXYZ(19, 6, 23, 20, 12, 23, FLOOR, "simple", "#FFFFFF");
				SwitchBByXYZ(19, 11, 15, 20, 12, 15);
				SwitchAByXYZ(19, 11, 17, 20, 12, 17);
				SwitchBByXYZ(19, 11, 19, 20, 12, 19);
				SwitchAByXYZ(19, 11, 21, 20, 12, 21);
				return true;
			}
			return false;
		}, function () {
			if (player.y <= 9)
			{
				SetByXYZ(19, 4, 23, 30, 5, 23, FLOOR, "simple", "#FFFFFF");
				ChangePosition(block1, 21, 4, 23);
				SwitchBByXYZ(23, 4, 21, 23, 5, 22);
				SwitchAByXYZ(26, 4, 21, 26, 5, 22);
				return true;
			}
			return false;
		});
		block1.events.push(function () {
			if (player.x == block1.x && player.y == block1.y && player.z == block1.z)
			{
				//ChangePosition(block1, 2 * block1.x - block1.rpX, 2 * block1.y - block1.rpY, block1.z);
				block1.moveX = block1.x - block1.rpX;
				block1.moveY = block1.y - block1.rpY;
				block1.moveZ = block1.z - block1.rpZ;
			}
			block1.rpX = player.x;
			block1.rpY = player.y;
			block1.rpZ = player.z;
			if (block1.z == 34)
			{
				ChangePosition(block1, 21, 4, 23);
				LightningAroundEntity(block1);
			}
			if (block1.x == 30 && block1.y == 4)
			{
				block1.timer = 0;
				new Effect(["square1", "square2", "square3", "square4", "square5", "square6", "square7", "square8", "teleport1", "teleport2", "teleport3", "teleport4", "teleport5", "teleport6", "teleport7"], 2, "#FFFFFF", 30, 4, 22);
				return true;
			}
			block1.timer ++;
			if (block1.timer >= 18 - 1 && block1.x != 0)
			{
				new Effect(["triangle6", "triangle6", "triangle6", "triangle5", "triangle4", "triangle5"], 3, "#FFFFFF", 30, 4, 23);
				block1.timer = 0;
			}
			return false;
		}, function() {
			block1.timer ++;
			if (block1.timer >= 16)
			{
				ChangePosition(block1, 0, 0, 30);
				return true;
			}
			return false;
		});
		//***
		break;
		case 3: // East A - Focus on "FLOAT"

		break;
		case 4: // South A - Focus on "MAGNET"

		break;
		case 5: // West A - Focus on "HOOK"

		break;
	}
	cameraX = player.x + 0.5;
	cameraY = player.y + 0.5;
	cameraZ = player.z;
	targetX = player.x + 0.5;
	targetY = player.y + 0.5;
	targetZ = player.z;
	promptMessage = new Message(">_", player);
	renderReady = true;
	SetUpAllConnections();

	for (var k = 0; k < AREA_DEPTH; k++)
	{
		var dLayer = layerList[k];
		for (var i = 0; i < AREA_WIDTH; i++)
		{
			for (var j = 0; j < AREA_HEIGHT; j++)
			{
				var tile = area[i][j][k];
				GetTileNumber(tile);
				if (tile.type == FLOOR)
				{
					dLayer.tctx.drawImage(filteredImages[GetFloorImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
				}
				else if (tile.type == WALL)
				{
					dLayer.tctx.drawImage(filteredImages[GetWallImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
				}
				else if (tile.type == OTHER)
				{
					dLayer.tctx.drawImage(filteredImages[GetOtherImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
				}
				if (tile.type != EMPTY)
				{
					dLayer.tDrawOn = true;
				}
				tile.previousTNumber = tile.tNumber;
				tile.previousType = tile.type;
				tile.previousTileset = tile.tileset;
				tile.previousColor = tile.color;
			}
		}
	}
	for (var e = 0; e < entityList.length; e++)
	{
		var entity = entityList[e];
		layerList[entity.z].entities.push(entity);
		layerList[entity.z].eNeedsUpdate = true;
		layerList[entity.z].eDrawOn = true;
	}
}*/


// Initializer function
function Init () {
	ready = true;
	SetUpArea();
	SetUpEntities();
	SetUpRender();

	// Render and update loop
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
	})();
	requestAnimFrame(Update);

}

// Main update loop
function Update () {
	if (!ready)
	{
		return;
	}
	//Control();
	//Action();
	KeyTimer();
	ItemAction(); //Only use for glowing items?
	ProcessEffects();
	Render();
	/*if (newLevel && levelTransition > 20)
	{
		StartLevel(levelNum);
		newLevel = false;
	}*/
	requestAnimFrame(Update);
};

function KeyTimer() {
	if ((Number(wKey) + Number(aKey) + Number(sKey) + Number(dKey)) == 1)
	{
		inputDelay --;
		if (inputDelay <= 0)
		{
			//wKey = false; aKey = false; sKey = false; dKey = false;
			Control();
			Action();
			inputDelay = 10;
		}
	}
	else
	{
		inputDelay = 0;
	}
}


// Player movement with WASD
function Control () {
	/*if (newLevel)
	{
		return;
	}*/
	if (aKey && !dKey)
	{
		player.moveX = -1;
	}
	if (dKey && !aKey)
	{
		player.moveX = 1;
	}
	if (!dKey && !aKey)
	{
		player.moveX = 0;
	}
	if (wKey && !sKey)
	{
		player.moveY = -1;
	}
	if (sKey && !wKey)
	{
		player.moveY = 1;
	}
	if (!sKey && !wKey)
	{
		player.moveY = 0;
	}
}

// Iterate through entities, do movement and other per-frame interactions
function Action () {
	//return; // lazy fix
	for (var i = 0; i < entityList.length; i++)
	{
		var entity = entityList[i];
		var curTile = entity.GetTile();
		FindPath(entity, player.GetTile());

		// Events
		/*if (entity.events.length != 0)
		{
			if (entity.events[0]())
			{
				entity.events.shift();
			}
		}*/

		//Moving and falling
		//if (IsSolid(entity.x, entity.y, entity.z))
		//{
			//if (entity.moveDelay <= 0)
			//{
				if (entity.path.length > 0)
				{
					if (entity.path[0] == curTile)
					{
						entity.path.shift();
						//Okay try again.
						if (entity.path.length > 0)
						{
							entity.moveX = entity.path[0].x - entity.x;
							entity.moveY = entity.path[0].y - entity.y;
						}
					}
					else
					{
						entity.moveX = entity.path[0].x - entity.x;
						entity.moveY = entity.path[0].y - entity.y;
					}
				}
				if (entity.moveX != 0 || entity.moveY != 0 )
				{
					var moved = EntityMove(entity, entity.moveX, entity.moveY);
					entity.moveX = 0;
					entity.moveY = 0;
					//if (moved)
					//{
					//	entity.moveDelay = entity.MAX_MOVE_DELAY;
					//}
				}
			//}
			//else
			//{
			//	entity.moveDelay --;
			//}
			
			//entity.fallDelay = entity.MAX_FALL_DELAY;
			//entity.fallSpeed = 0;
		//}
		/*else
		{
			entity.fallDelay --;
			if (entity.fallDelay < 1)
			{
				EntityMove(entity,0, 0, 1);
				entity.fallSpeed ++;
				if (entity.fallSpeed >= entity.MAX_FALL_DELAY)
				{
					entity.fallSpeed --;
				}
				entity.fallDelay = entity.MAX_FALL_DELAY - entity.fallSpeed;
			}
		}*/
		// Communication
		/*ProcessMessage(entity);
		if (entity.outMesgQueue.length > 0)
		{
			entity.respondDelay --;
			if (entity.respondDelay <= 0)
			{
				new Message(entity.outMesgQueue.shift(), entity);
				entity.respondDelay = entity.MAX_RESPOND_DELAY;
			}
		}
		else
		{
			entity.respondDelay = entity.MAX_RESPOND_DELAY;
		}
		if (entity.STAMINA < 100)
		{
			entity.STAMINA ++;
		}
		// Items
		if (curTile.items.length > 0)
		{
			for (var o = 0; o < curTile.items.length; o ++)
			{
				var item = curTile.items[o];
				if (item.type == COLLECT)
				{
					layerList[item.z].eNeedsUpdate = true;
					layerList[item.z].items.splice(layerList[item.z].items.indexOf(item), 1);
					itemList.splice(itemList.indexOf(item), 1);
					curTile.items.splice(o, 1);
					o --;
				}
			}
		}*/
	}
}

function ItemAction () {
	return; // not now
	//Only use for glowing items?
	for (var i = 0; i < itemList.length; i++)
	{
		var item = itemList[i];
		if (item.type == FALL)
		{
			var curTile = item.GetTile();
			if (curTile.type == FLOOR || curTile.type == WALL || item.z == AREA_DEPTH - 1)
			{
				// Dissapear and "splash"
				layerList[item.z].eNeedsUpdate = true;
				layerList[item.z].items.splice(layerList[item.z].items.indexOf(item), 1);
				item.GetTile().items.splice(item.GetTile().items.indexOf(item), 1);
				itemList.splice(i, 1);
				i --;
			}
			else
			{
				// Fall down one layer
				layerList[item.z].eNeedsUpdate = true;
				layerList[item.z].items.splice(layerList[item.z].items.indexOf(item), 1);
				item.GetTile().items.splice(item.GetTile().items.indexOf(item), 1);
				item.z ++;
				layerList[item.z].eNeedsUpdate = true;
				layerList[item.z].eDrawOn = true;
				layerList[item.z].items.push(item);
				item.GetTile().items.push(item);
			}
		}
	}
}

// Try moving an entity, with a normal step
function EntityMove (entity, x, y) {
	if (!(((x == 1 || x == -1) && y == 0) || ((y == 1 || y == -1) && x == 0)))
	{
		return false;
		// Entities can only move by one space, orthogonally
	}
	var ex = entity.x;
	var ey = entity.y;
	if (!CheckBounds(0, AREA_SIZE - 1, [ex + x, ey + y]))
	{
		return false;
	}
	if (area[ex + x][ey + y].type == FLOOR)
	{
		ChangePosition(entity, ex + x, ey + y);
		return true;
	}
	return false;
	/*if (IsSolid(ex + x, ey + y, ez + z - 1))
	{
		if (!IsSolid(ex + x, ey + y, ez + z - 2) && !IsSolid(ex, ey, ez - 2))
		{
			//Move up step
			ChangePosition(entity, ex + x, ey + y, ez + z - 1);
			return true;
		}
	}
	else
	{
		ChangePosition(entity, ex + x, ey + y, ez + z);
		return true;
	}
	if (x != 0 && y != 0)
	{
		// May be moving diagonally into a wall. Split into X and Y movement
		return EntityMove(entity, x, 0, 0) || EntityMove(entity, 0, y, 0);
	}*/
}

// Actually move an entity to a location.
// (Assumes new position is valid)
// (Updates tile content data correctly)
function ChangePosition (entity, newX, newY)
{
	if (!CheckBounds(0, AREA_SIZE - 1, [newX, newY]))
	{
		Debug("ChangePosition failed: outside bounds");
		return;
	}

	var prevTile = area[entity.x][entity.y];
	var newTile = area[newX][newY];
	var index = prevTile.entities.indexOf(entity);
	if (index == -1)
	{
		Debug("Change position failed: entity not in previous location?");
		return;
	}
	//var eLayer = layerList[entity.z];
	//eLayer.eNeedsUpdate = true;
	/*if (newZ != entity.z)
	{
		eLayer.entities.splice(eLayer.entities.indexOf(entity), 1);
		var newLayer = layerList[newZ];
		newLayer.entities.push(entity);
		newLayer.eNeedsUpdate = true;
		newLayer.eDrawOn = true;
	}*/
	

	prevTile.entities.splice(index, 1);
	newTile.entities.push(entity);
	entity.x = newX;
	entity.y = newY;
	DrawTileContent(prevTile);
	DrawTileContent(newTile);

	//RenderTile(prevTile);
	//RenderTile(newTile);
}

// Return if a location is solid or not.
// If not a valid tile, return true
function IsSolid (x, y, z)
{
	if (x % 1 == 0 && y % 1 == 0 && z % 1 == 0)
	{
		if (CheckBounds(0, AREA_SIZE - 1, [x, y, z]))
		{
			return area[x][y][z].type != EMPTY;
		}
	}
	//Default: Yes Solid
	return true;
}

// Pathfinding - sets an entity's path array to a list of tiles to move to.
// Also sets the entity's foundPath value
// Based on pseudocode from http://en.wikipedia.org/wiki/A*_search_algorithm
function FindPath (entity, destination) {
	//return; //Pathfinding
	var closedSet = [];
	var openSet = [new PathNode(area[entity.x][entity.y], destination, 0, null)];
	var cameFrom = [];
	while (openSet.length > 0)
	{
		openSet.sort(SortNodes);
		var current = openSet[0];
		if (current.tile == destination)
		{
			var path = [];
			entity.foundPath = true;
			ReconstructPath(current, path);
			entity.path = path;
			return;
		}
		closedSet.push(openSet.shift());
		for (var i = 0; i < current.tile.edges.length; i ++)
		{
			var neighbor = new PathNode(current.tile.edges[i], destination, current.cost + 1, current);
			var dup = CheckForDuplicate(closedSet, neighbor);
			var closedCost = 9999;
			if (dup != -1)
			{
				closedCost = closedSet[dup].cost;
				if (neighbor.cost >= closedCost)
				{
					continue;
				}
			}
			var openDup = CheckForDuplicate(openSet, neighbor);
			if (openDup == -1)
			{
				openSet.push(neighbor);
			}
			else if (neighbor.cost < openSet[openDup].cost)
			{
				openSet[openDup] = neighbor;
			}
		}
	}
	Debug("Can't find path");
	entity.foundPath = false;
	return;
}

// Backtrack through nodes' parent data to recreate path
function ReconstructPath (node, path)
{
	path.unshift(node.tile);
	//node.tile.color = "blue"
	if (node.parent != null)
	{
		ReconstructPath(node.parent, path);
	}
}


//Return an index if there the tile is already in the array, -1 otherwise
function CheckForDuplicate (array, newNode) {
	var newTile = newNode.tile;
	for (var i = 0; i < array.length; i++)
	{
		var oldTile = array[i].tile;
		
		if (oldTile == newTile)
		{
			return i;
		}
	}
	return -1;
}

// Add a node to an array but only if there is no lower cost node already present
// If there is one, replace it if the new one has a lower cost
function AddNodeWithoutDuplicate (array, newNode) {
	var newTile = newNode.tile;
	for (var i = 0; i < array.length; i++)
	{
		var oldTile = array[i].tile;
		
		if (oldTile == newTile)
		{
			if (array[i].cost > newNode.cost)
			{
				array.splice(i, 1);
				array.push(newNode);
			}
			return;
		}
	}
	array.push(newNode);
}

// Sorting function for nodes, sorting by cost + distance estimate
function SortNodes (a, b) {

	return (a.cost + a.distEst) - (b.cost + b.distEst);
}

// Go through all the effects
function ProcessEffects () {
	for (var i = 0; i < effectList.length; i++)
	{
		var effect = effectList[i];
		effect.delay --;
		if (effect.delay <= 0)
		{
			effect.delay = effect.MAX_DELAY;
			effect.imageList.shift();
			if (effect.imageList.length == 0)
			{
				//layerList[effect.z].eNeedsUpdate = true;
				//layerList[effect.z].effects.splice(layerList[effect.z].effects.indexOf(effect), 1);
				var tile = effect.GetTile();
				tile.effects.splice(tile.effects.indexOf(effect), 1);
				effectList.splice(i, 1);
				i--;
				//RenderTile(tile);
				DrawTileContent(tile);
			}
			else
			{
				DrawTileContent(effect.GetTile())
				//layerList[effect.z].eNeedsUpdate = true;
			}
		}
	}
	return;
}

// Clear the canvas
function Clear () {
	// Clear screen
	ctx.clearRect(0, 0, 630, 630);
	//canvas.width = canvas.width;
	return;
	//Headache mode
	SetColor("#000000");
	SetAlpha(0.5);
	ctx.fillRect(0, 0, 630, 630);
}

// Set Color State function
// Changes ctx's color only if necessary
var ctxColor = "#000000";
function SetColor(color)
{
	if (color != ctxColor)
	{
		ctxColor = color;
		ctx.fillStyle = color;
	}
}

// Set Alpha State function
// Changes ctx's alpha only if necessary
var ctxAlpha = 1;
function SetAlpha(alpha)
{
	if (alpha != ctxAlpha)
	{
		ctxAlpha = alpha;
		ctx.setAlpha(alpha);
	}
}

var myX = 1;
var myY = 30;
// Rendering function.
// 1. Clear screen
// 2. Adjust camera
// 3. Draw 3D grid of tiles
// 4. Reposition text boxes
// 5. Draw text boxes
var ff = 0;
function Render () {
	if (ff <= -6)
	{
		ff = 6;
		//return;
	}
	ff -= 0.1;
	
	if (!ready)
	{
		return;
	}
	Clear();
	
	// Camera Adjustment
	// targetX = player.x + 0.25;
	// targetY = player.y + 0.75;
	// targetZ = player.z;

	targetX = (player.x + 0.5 + targetX * 4) * 0.2;
	targetY = (player.y + 0.5 + targetY * 4) * 0.2;
	//targetZ = (player.z + targetZ * 4) * 0.2;

	cameraX = (targetX + cameraX * 4) * 0.2;
	cameraY = (targetY + cameraY * 4) * 0.2;
	//cameraZ = (targetZ + cameraZ * 4) * 0.2;

	//cameraX = Math.round(cameraX); 
	//cameraY = Math.round(cameraY); 
	
	//cameraX = player.x;
	//cameraY = player.y;
	//cameraZ = player.z;


	//Draw 3D grid of tiles - canvas layer method
	//for (var zi = Math.min(AREA_DEPTH - 1, Math.floor(cameraZ) + 18); zi > Math.max(-1, Math.floor(cameraZ) - 18); zi--)
	//{
		//var layer = layerList[zi];
		//if (layer.tDrawOn || layer.eDrawOn)
		//{
			//SetAlpha((player.z == zi) ? 1 : Math.max(1 - Math.abs(zi - cameraZ) * .05 - 0.15, 0));
			//SetAlpha(Math.max(1 - Math.abs(zi - cameraZ) * .05 - 0.15, 0));
			SetAlpha(1);
			//var canvDraw = layerList[zi].tCanvas;
			var clipW = 630;//30000 / (50 - zi + cameraZ);
			var clipH = clipW;
			var baseClipW = clipW;
			var baseClipH = clipH;
			var clipX = Math.round(cameraX * 30) / 30 * 30 - clipW / 2;
			var clipY = Math.round(cameraY * 30) / 30 * 30 - clipH / 2;
			var drawX = 0;
			var drawY = 0;
			var drawW = 630;
			var drawH = 630;
			
			if (clipX < 0)
			{
				drawX -= clipX * 630 / baseClipW;
				drawW += clipX * 630 / baseClipW;
				clipW += clipX;
				clipX = 0;
			}
			if (clipY < 0)
			{
				drawY -= clipY * 630 / baseClipH;
				drawH += clipY * 630 / baseClipH;
				clipH += clipY;
				clipY = 0;
			}
			var overR = clipX + clipW - tCanvas.width;
			if (overR > 0)
			{
				drawW -= overR * 630 / baseClipW;
				clipW -= overR;
			}
			var overB = clipY + clipH - tCanvas.height;
			if (overB > 0)
			{
				drawH -= overB * 630 / baseClipH;
				clipH -= overB;
			}
			//if (layer.tDrawOn)
			//{
				ctx.drawImage(tCanvas, clipX, clipY, clipW, clipH, drawX, drawY, drawW, drawH);
			//}
			//if (layer.eDrawOn)
			//{
				//if (layer.eNeedsUpdate)
				//{
					//ectx.clearRect(0, 0, eCanvas.width, eCanvas.height);
					//RenderLayerE();
					//layer.eNeedsUpdate = false;
				//}
				ctx.drawImage(eCanvas, clipX, clipY, clipW, clipH, drawX, drawY, drawW, drawH);
			//}
		//}
	//}
	// Stuff for promptMessage
	if (writingMessage)
	{
		promptMessage.fade = 200;
		promptMessage.text = ">" + messageInput + "_";
		promptMessage.boxWidth = promptMessage.text.length * 10 + 6;
		if (isPromptMagic)
		{
			textGlow ++;
			if (textGlow >= 50)
			{
				textGlow = 0;
			}
		}
		else if (textGlow > 0)
		{
			textGlow --;
		}
		promptMessage.color = BlendColors("#0040FF", player.color, Math.abs(textGlow - 25) / 25);
	}
	else
	{
		promptMessage.fade = -49;
		promptMessage.text = "";
		promptMessage.boxWidth = promptMessage.text.length * 10 + 6;
		textGlow = 0;
	}
	// Reposition text boxes
	var m;
	for (m = 0; m < messages.length; m++)
	{
		messages[m].FixPosX();
		messages[m].FixPosY();
	}
	var reCheckList = messages.slice(0);
	reCheckList.pop();
	while (reCheckList.length > 0)
	{
		var mesg = reCheckList.pop();
		var m = messages.indexOf(mesg);
		var m2;
		for (m2 = 0; m2 < m; m2++)
		{
			var mesg2 = messages[m2];
			if ((Math.abs(mesg.targetY - mesg2.targetY) < 16) && (Math.abs(mesg.targetX - mesg2.targetX) < (mesg.boxWidth + mesg2.boxWidth) / 2))
			{
				mesg2.targetY = mesg.targetY - 16;
				if (reCheckList.indexOf(mesg2) == -1)
				{
					reCheckList.push(mesg2);
				}
			}
		}
		var n = -1;
		if (writingMessage)
		{
			n = 0;
		}
		for (m2 = m + 1; m2 < messages.length + n; m2++)
		{
			var mesg2 = messages[m2];
			if ((Math.abs(mesg.targetY - mesg2.targetY) < 16) && (Math.abs(mesg.targetX - mesg2.targetX) < (mesg.boxWidth + mesg2.boxWidth) / 2))
			{
				mesg.targetY = mesg2.targetY - 16;
				if (reCheckList.indexOf(mesg) == -1)
				{
					reCheckList.push(mesg);
				}
			}
		}
	}
	// Draw text boxes
	ctx.font = "bold 16px Courier New";
	for (var m = 0; m < messages.length; m ++)
	{
		var mesg = messages[m];
		var entity = mesg.entity;
		mesg.x = (mesg.x + mesg.targetX) / 2;
		mesg.y = (mesg.y + mesg.targetY) / 2;
		DrawTextBox(mesg);
		
		mesg.fade --;
		if (mesg.fade < -51)
		{
			messages.splice(m, 1);
			m --;
		}
	}
	/*
	if (newLevel)
	{
		levelTransition ++;
		SetAlpha(Math.min(levelTransition * 0.05, 1));
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 600, 600);
	}
	else if (levelTransition > 0)
	{
		levelTransition --;
		SetAlpha(Math.min(levelTransition * 0.05, 1));
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 600, 600);
	}
	*/
	/*
	SetAlpha(1);
	SetColor("#000000");
	ctx.strokeRect(0, 0, 600, 600);
	ctx.strokeStyle = "#00FFFF";
	ctx.strokeRect(600, 0, 200, 600);
	DrawTextRaw("HP: " + player.HP, "#FF0000", 700, 20);
	DrawTextRaw("MP: " + player.MP, "#0040FF", 700, 40);
	DrawTextRaw("STAMINA: " + StaminaDisplay(player.STAMINA) + "%", "#FFFFFF", 700, 60);
	DrawTextRaw("Weapon:   ", "#FFFFFF", 700, 100);
	DrawTextRaw("Armor:   ", "#FFFFFF", 700, 120);
	DrawTextRaw("Hat:   ", "#FFFFFF", 700, 140);
	DrawTextRaw("Spells:", "#0040FF", 700, 180);
	DrawTextRaw("FIREBALL", "#FF4000", 700, 200);
	DrawTextRaw("WALL", "#B08040", 700, 220);
	DrawTextRaw("TELEPORT", "#80FFFF", 700, 240);
	*/
	//FilterScreen();
	
	// Centering boxes
	/*
	SetAlpha(1);
	SetColor("#00FFFF");
	ctx.strokeRect(0, 0, 630, 630);
	ctx.strokeRect(0, 0, 315, 315);
	ctx.strokeRect(315, 315, 315, 315);
	*/
	//DrawTextRaw("1: SWITCH", "#00FFFF", 50, 590);
	if (!cursorVisible)
	{
		SetAlpha(1);
		ctx.save();
		//ctx.strokeRect(mouseX - 5, mouseY - 5, 10, 10);
		ctx.strokeStyle = "#00FFFF";
		//ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(mouseX, mouseY - 7);
		ctx.lineTo(mouseX + 7, mouseY);
		ctx.lineTo(mouseX, mouseY + 7);
		ctx.lineTo(mouseX - 7, mouseY);
		ctx.lineTo(mouseX, mouseY - 7);

		ctx.moveTo(mouseX, mouseY - ff);
		ctx.lineTo(mouseX + ff, mouseY);
		ctx.lineTo(mouseX, mouseY + ff);
		ctx.lineTo(mouseX - ff, mouseY);
		ctx.lineTo(mouseX, mouseY - ff);

		var tcx = (TileFromMouseX() + 10.5 - cameraX) * 30;
		var tcy = (TileFromMouseY() + 10.5 - cameraY) * 30;
		//ctx.moveTo
		/*ctx.moveTo(tcx + 14.5, tcy + 4 + ff);
		ctx.lineTo(tcx + 26 - ff, tcy + 14.5);
		ctx.lineTo(tcx + 14.5, tcy + 26 - ff);
		ctx.lineTo(tcx + 4 + ff, tcy + 14.5);
		ctx.lineTo(tcx + 14.5, tcy + 4 + ff);
		*/

		ctx.stroke();
		ctx.strokeRect(tcx, tcy, 30, 30);

		ctx.restore();
	}
}

// Do not use, is only for example (Serious lag)
function FilterScreen () {
	var data = ctx.getImageData(0, 0, 50, 50);
	for (var i = 0; i < data.data.length; i+= 4) {
		var r = data.data[i];
		var g = data.data[i+1];
		var b = data.data[i+2];
		data.data[i] = r * 0.5;
		data.data[i+1] = g * 0.5;
		data.data[i+2] = b * 0.5;
	}
	ctx.putImageData(data, 0, 0);
}

// Appends 0's to stamina number
function StaminaDisplay (stamina)
{
	if (stamina < 10)
	{
		return "  " + stamina;
	}
	if (stamina < 100)
	{
		return " " + stamina;
	}
	return stamina;
}

// Blend two colors together.
// weight is 1 if completely color2, 0.5 if halfway between 1 and 2
function BlendColors (color1, color2, weight)
{
	var r1 = parseInt(color1.slice(1, 3), 16);
	var g1 = parseInt(color1.slice(3, 5), 16);
	var b1 = parseInt(color1.slice(5, 7), 16);
	var r2 = parseInt(color2.slice(1, 3), 16);
	var g2 = parseInt(color2.slice(3, 5), 16);
	var b2 = parseInt(color2.slice(5, 7), 16);
	var oWeight = 1 - weight;
	var rm = Math.round(r1 * oWeight + r2 * weight);
	var rms = rm.toString(16)
	rms = (rms.length == 1) ? "0" + rms : rms
	var gm = Math.round(g1 * oWeight + g2 * weight);
	var gms = gm.toString(16)
	gms = (gms.length == 1) ? "0" + gms : gms
	var bm = Math.round(b1 * oWeight + b2 * weight);
	var bms = bm.toString(16)
	bms = (bms.length == 1) ? "0" + bms : bms
	return "#" + rms + gms + bms;
}

// Draw a text box, given a message.
// Does fade out stuff
function DrawTextBox (message) {
	SetColor("#000000");
	var mColor = (message.glow) ? BlendColors(message.color, message.glowColor, Math.random()) : message.color;
	ctx.strokeStyle = mColor;
	var alpha;
	if (message.fade > 0)
	{
		alpha = 1;
	}
	else
	{
		alpha = Math.max(0, (1 + (message.fade) * 0.02));
	}
	SetAlpha(0.85 * alpha);
	ctx.fillRect(message.x - message.boxWidth / 2, message.y - 12, message.boxWidth, message.boxHeight);
	ctx.strokeRect(message.x - message.boxWidth / 2, message.y - 12, message.boxWidth, message.boxHeight);
	SetAlpha(alpha);
	SetColor(mColor);
	//ctx.fillText(message.text, message.x + 3 - message.boxWidth / 2, message.y);
	DrawText(message.text, message.x + 3 - message.boxWidth / 2, message.y);
}

// Draw a text box, given a string, color, and position
// Does fade out stuff
function DrawTextRaw (text, color, x, y) {
	SetColor("#000000");
	ctx.strokeStyle = color;
	var boxWidth = text.length * 10 + 6
	SetAlpha(0.85);
	ctx.fillRect(x - boxWidth / 2, y - 12, boxWidth, 16);
	ctx.strokeRect(x - boxWidth / 2, y - 12, boxWidth, 16);
	SetAlpha(1);
	SetColor(color);
	DrawText(text, x + 3 - boxWidth / 2, y);
}

// Draws text, after rounding down (floor) to nearest x, y
function DrawText (text, x, y)
{
	ctx.fillText(text, (0.5 + x) | 0, (0.5 + y) | 0);
}

// Determines the X position on the screen for an entity
function EntityScreenX (entity) {
	return 315 + (entity.x - cameraX) * 30;// * (50 - entity.z + cameraZ) * 0.6;
	// 0.6 is 30/50
}

// Determines the Y position on the screen for an entity
function EntityScreenY (entity) {
	return 315 + (entity.y - cameraY) * 30;// * (50 - entity.z + cameraZ) * 0.6;
}

function TileFromMouseX () {
	return Math.min(AREA_WIDTH - 1, Math.max(0, Math.round(mouseX / 30 + cameraX - 11)));
}

function TileFromMouseY () {
	return Math.min(AREA_HEIGHT - 1, Math.max(0, Math.round(mouseY / 30 + cameraY - 11)));
}

// Mouse position
function MousePos (e) {
	mouseX = e.clientX - 8;
	mouseY = e.clientY - 8;
	if (cursorVisible)
	{
		cursorVisible = false;
		document.getElementById("game_canvas").style.cursor = "none";
		//Debug("Backup cursro hide")
	}
}


function hoverOn (e) {
	document.getElementById("game_canvas").style.cursor = "none";
	//Debug("Hover On");
	cursorVisible = false;
}
function hoverOff (e) {
	document.getElementById("game_canvas").style.cursor = "";
	//Debug("hover Off");
	cursorVisible = true;
}

// Mouse down listener
window.addEventListener('mousedown', DoMouseDown, true);

// Mouse down event
function DoMouseDown (e) {
	if (!cursorVisible)
	{
		ChangePosition(player, TileFromMouseX(), TileFromMouseY());
	}
	
}

// Keyboard event listeners
window.addEventListener('keypress', DoKeyPress, true);
window.addEventListener('keydown', DoKeyDown, true);
window.addEventListener('keyup', DoKeyUp, true);

// Character input function
// Writing messages - only allows character and number input
// Capital letters is taken care of with magics
function DoKeyPress (e) {
	if (writingMessage)
	{
		if (e.keyCode == 13 && !enterPressed)
		{
			if (messageInput.length == 0)
			{
				writingMessage = false;
				isPromptMagic = false;
				return;
			}
			var mesg = new Message(messageInput, player);
			if (isPromptMagic)
			{
				var result = ProcessSpell(player, messageInput);
				if (result)
				{
					mesg.glow = true;
					mesg.glowColor = result;
				}
			}
			messageInput = "";
			writingMessage = false;
			isPromptMagic = false;
			return;
		}
		var letter = String.fromCharCode(e.keyCode);
		letter = letter.replace(/[^a-zA-Z0-9 ]/g, '');
		messageInput += letter;
		isPromptMagic = CheckMagicWord(messageInput);
		return;
	}
}

// Key Down event:
// Does key input (sets booleans to true)
// Prevents Back key from going back a page
function DoKeyDown (e) {
	if (writingMessage)
	{
		if (e.keyCode == 8)
		{
			messageInput = messageInput.slice(0, messageInput.length - 1);
			e.preventDefault();
			isPromptMagic = CheckMagicWord(messageInput);
		}
		return;
	}
	else if (e.keyCode == 8)
	{
		e.preventDefault();
	}
	if (e.keyCode == 13)
	{
		if (!enterPressed)
		{
			writingMessage = true;
			wKey = false;
			aKey = false;
			sKey = false;
			dKey = false;
		}
		enterPressed = true;
		return;
	}
	if (e.keyCode == 87) {
		/*aKey = false;
		sKey = false;
		dKey = false;
		if (!wKey)
		{*/
			wKey = true;
			/*Control();
			Action();
		}*/
		return;
	}
	if (e.keyCode == 65) {
		/*wKey = false;
		sKey = false;
		dKey = false;
		if (!aKey)
		{*/
			aKey = true;
			/*Control();
			Action();
		}*/
		return;
	}
	if (e.keyCode == 83) {
		/*wKey = false;
		aKey = false;
		dKey = false;
		if (!sKey)
		{*/
			sKey = true;
			/*Control();
			Action();
		}*/
		return;
	}
	if (e.keyCode == 68) {
		/*wKey = false;
		aKey = false;
		sKey = false;
		if (!dKey)
		{*/
			dKey = true;
			/*Control();
			Action();
		}*/
		return;
	}
	if (e.keyCode == 38) {
		EffectSlashUp();
		//wKey = true;
		return;
	}
	if (e.keyCode == 40) {
		EffectSlashDown();
		//sKey = true;
		return;
	}
	if (e.keyCode == 37) {
		EffectSlashLeft();
		//aKey = true;
		return;
	}
	if (e.keyCode == 39) {
		EffectSlashRight();
		//dKey = true;
		return;
	}

	if (e.keyCode == 81) {
		//q
		SetTile(player.x, player.y, EMPTY, "", "#000000");
		//StartLevel(2);
		//SetTile(player.x, player.y, player.z, FLOOR, "bubbles", "#FF0000");
		//TestColorAroundPlayer();
		//FindPath(skeleton, area[player.x][player.y][player.z]);
		//new Message("SSSSSS", skeleton);
		//new Message("SSSSSSSSS", entities[4]);
		/*if (pstartX == undefined)
		{
			pstartX = player.x;
			pstartY = player.y;
			pstartZ = player.z;
		}
		else
		{
			Debug("SetByXYZ(" +
			pstartX + ", " + pstartY + ", " + pstartZ + ", " + 
			player.x + ", " + player.y + ", " + player.z +
			", true, \"~\", \"#FFFFFF\");");
			pstartX = undefined;
			pstartY = undefined;
			pstartZ = undefined;
		}*/
	}
	if (e.keyCode == 69) {
		//e
		//ChangePosition(player, player.x, player.y, 0);
		//Debug(NextSolidTileDown(area[player.x][player.y - 1][player.z]));
		//FindPath(entities[2], area[player.x][player.y][player.z]);
		//new Message("FFFFFFFF", entities[2]);
		//new Message("OOOOOOOOOOO", entities[3]);
		//Debug("MakeBush(" + player.x + ", " + player.y + ", " + player.z + ");");
	}
	if (e.keyCode == 90) {
		//z
		//new Item(FALL, "circle1", "#0000FF", player.x + 1, player.y, 0);
		//for (var i = 0; i < 34; i++){new Effect(["circle1", "circle2", "circle3", "circle4", "circle5", "circle6", "circle4", "circle3", "circle2", "circle1"], 2, "#FFFFFF", player.x, i, player.z);new Effect(["circle1", "circle2", "circle3", "circle4", "circle5", "circle6", "circle4", "circle3", "circle2", "circle1"], 2, "#FFFFFF",  i, player.y, player.z);}
		//new Effect(["square1", "square2", "square3", "square4", "square5", "square6", "square7", "square8", "teleport1", "teleport2", "teleport3", "teleport4", "teleport5", "teleport6", "teleport7"], 1, "#FFFFFF", player.x, player.y, player.z - 1);
		Debug("X: " + player.x + ", Y: " + player.y);
	}
	if (e.keyCode == 49)
	{
		// 1
		Cast_SWITCH();
		new Message("SWITCH", player);
	}
	//Debug(e.keyCode);
}
//var pstartX = undefined;
//var pstartY = undefined;
//var pstartZ = undefined;

// Key Up event:
// Does key input (sets booleans to false)
function DoKeyUp (e) {
	if (e.keyCode == 87) {
		wKey = false;
		return;
	}
	if (e.keyCode == 65) {
		aKey = false;
		return;
	}
	if (e.keyCode == 83) {
		sKey = false;
		return;
	}
	if (e.keyCode == 68) {
		dKey = false;
		return;
	}
	if (e.keyCode == 38) {
		//wKey = false;
		return;
	}
	if (e.keyCode == 40) {
		//sKey = false;
		return;
	}
	if (e.keyCode == 37) {
		//aKey = false;
		return;
	}
	if (e.keyCode == 39) {
		//dKey = false;
		return;
	}
	if (e.keyCode == 13) {
		enterPressed = false;
		return;
	}
}



// Generates a random color
// Code from http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
function RandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

// MAGIC ARRAY FIXES YOUR PROBLEMS
var T_NUM_FIX = [ 0,  1,  0,  1,  2,  3,  2,  4,  0,  1,  0,  1,  2,  3,  2,  4,  5,  6,  5,  6,  7,  8,  7,  9,  5,  6,  5,  6, 10, 11, 10, 12,
				  0,  1,  0,  1,  2,  3,  2,  4,  0,  1,  0,  1,  2,  3,  2,  4,  5,  6,  5,  6,  7,  8,  7,  9,  5,  6,  5,  6, 10, 11, 10, 12,
				 13, 14, 13, 14, 15, 16, 15, 17, 13, 14, 13, 14, 15, 16, 15, 17, 18, 19, 18, 19, 20, 21, 20, 22, 18, 19, 18, 19, 23, 24, 23, 25,
				 13, 14, 13, 14, 15, 16, 15, 17, 13, 14, 13, 14, 15, 16, 15, 17, 26, 27, 26, 27, 28, 29, 28, 30, 26, 27, 26, 27, 31, 32, 31, 33,
				  0,  1,  0,  1,  2,  3,  2,  4,  0,  1,  0,  1,  2,  3,  2,  4,  5,  6,  5,  6,  7,  8,  7,  9,  5,  6,  5,  6, 10, 11, 10, 12,
				  0,  1,  0,  1,  2,  3,  2,  4,  0,  1,  0,  1,  2,  3,  2,  4,  5,  6,  5,  6,  7,  8,  7,  9,  5,  6,  5,  6, 10, 11, 10, 12,
				 13, 34, 13, 34, 15, 35, 15, 36, 13, 34, 13, 34, 15, 35, 15, 36, 18, 37, 18, 37, 20, 38, 20, 39, 18, 37, 18, 37, 23, 40, 23, 41,
				 13, 34, 13, 34, 15, 35, 15, 36, 13, 34, 13, 34, 15, 35, 15, 36, 26, 42, 26, 42, 28, 43, 28, 44, 26, 42, 26, 42, 31, 45, 31, 46]

// Determines the tile number (tileset position) to use, based on the surrounding tiles.
function GetTileNumber(tile) {
	var t = tile.type;
	if (t == EMPTY || t == OTHER)
	{
		tile.tNumber = 0;
		return;
	}
	var x = tile.x;
	var y = tile.y;
	
	if (t == FLOOR)
	{
		var tNumA = MtTyp(x, y-1, t, 1) + MtTyp(x+1, y-1, t, 2) + MtTyp(x+1, y, t, 4) + MtTyp(x+1, y+1, t, 8) + 
			MtTyp(x, y+1, t, 16) + MtTyp(x-1, y+1, t, 32) + MtTyp(x-1, y, t, 64) + MtTyp(x-1, y-1, t, 128);
		tile.tNumber = T_NUM_FIX[tNumA];
		return;
	}
	else if (t == WALL)
	{
		tile.tNumber = MtTyp(x, y-1, t, 1) + MtTyp(x+1, y, t, 2) + MtTyp(x, y+1, t, 4) + MtTyp(x-1, y, t, 8);
		return;
	}
	tile.tNumber = 0;
	return; // Unknown
}

function GetTypeFromXY(x, y) {
	if (CheckBounds(0, AREA_SIZE - 1, [x, y]))
	{
		return area[x][y].type;
	}
	else
	{
		return 0;
	}
}

function MtTyp(x, y, type, A) {
	if (GetTypeFromXY(x, y) == type)
	{
		return A;
	}
	else
	{
		return 0;
	}
}



// Prints a line to the console
function Debug (message) {
	window.console.log(message);
}