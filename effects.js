
function EffectDie (entity) {
	new Effect (["triangle1", "triangle2", "triangle3", "triangle4", "triangle5", "triangle6"], 3, entity.color, entity.x, entity.y);
}

function EffectLevelUp(entity) {
	new Effect (["square1", "square2", "square3", "square4", "square5", "square6", "square7", "square8", 
		"teleport1", "teleport2", "teleport3", "teleport4", "teleport5", "teleport6", "teleport7", ], 3, entity.color, entity.x, entity.y);
}

function EffectSlashUp (entity) {
	new Effect (["slash1U", "slash2U", "slash3U", "slash4U", "slash5U"], 3, "#00FFFF", player.x, player.y - 1);
}
function EffectSlashDown (entity) {
	new Effect (["slash1D", "slash2D", "slash3D", "slash4D", "slash5D"], 3, "#00FFFF", player.x, player.y + 1);
}
function EffectSlashLeft (entity) {
	new Effect (["slash1L", "slash2L", "slash3L", "slash4L", "slash5L"], 3, "#00FFFF", player.x - 1, player.y);
}
function EffectSlashRight (entity) {
	new Effect (["slash1R", "slash2R", "slash3R", "slash4R", "slash5R"], 3, "#00FFFF", player.x + 1, player.y);
}
