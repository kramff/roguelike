
function EffectDie (entity) {
	new Effect(["triangle1", "triangle2", "triangle3", "triangle4", "triangle5", "triangle6"], 3, entity.color, entity.x, entity.y);
}

function EffectLevelUp(entity) {
	new Effect(["square1", "square2", "square3", "square4", "square5", "square6", "square7", "square8", 
		"teleport1", "teleport2", "teleport3", "teleport4", "teleport5", "teleport6", "teleport7", ], 3, entity.color, entity.x, entity.y);
}

function EffectSlashUp (entity) {
	new Effect(["slash1U", "slash2U", "slash3U", "slash4U", "slash5U"], 3, entity.color, entity.x, entity.y - 1);
}
function EffectSlashDown (entity) {
	new Effect(["slash1D", "slash2D", "slash3D", "slash4D", "slash5D"], 3, entity.color, entity.x, entity.y + 1);
}
function EffectSlashLeft (entity) {
	new Effect(["slash1L", "slash2L", "slash3L", "slash4L", "slash5L"], 3, entity.color, entity.x - 1, entity.y);
}
function EffectSlashRight (entity) {
	new Effect(["slash1R", "slash2R", "slash3R", "slash4R", "slash5R"], 3, entity.color, entity.x + 1, entity.y);
}

function EffectItemGlow (item) {
	new Effect([item.image, item.image, item.image, "", item.image, "", item.image, "", item.image], 3, BlendColors(item.color, "#FFFFFF", 0.5), item.x, item.y);
}

function EffectLightningOld (entity) {
	new Effect(["lightning1", "lightning2", "lightning3", "lightning2", "lightning1"], 3, entity.color, entity.x, entity.y - 1);
	new Effect(["lightning1", "lightning2", "lightning3", "lightning2", "lightning1"], 3, entity.color, entity.x, entity.y + 1);
	new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, entity.color, entity.x - 1, entity.y);
	new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, entity.color, entity.x + 1, entity.y);
}