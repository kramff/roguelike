var compressedArea = [];

function AreaCompressor () {
	compressedArea = [];
	for (var i = 0; i < area.length; i++)
	{
		compressedArea.push([]);
		for (var j = 0; j < area[i].length; j++)
		{
			var tile = area[i][j];
			compressedArea[i].push({type:tile.type, tileset:tile.tileset, color:tile.color, x:i, y:j});
		}
	}
}

var compressedEntities = [];

function EntityCompressor () {
	compressedEntities = [];
	for (var i = 0; i < entityList.length; i++)
	{
		var entity = entityList[i];
		compressedEntities.push({name:entity.name, image:entity.image, color:entity.color, x:entity.x, y:entity.y});
	}
}

var compressedItems = [];

//do this eventually
function ItemCompressor () {
	compressedItems = [];
}