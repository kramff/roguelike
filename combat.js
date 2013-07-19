function AttackTo (attacker, targetTile) {
	if (Math.abs(attacker.x - targetTile.x) + Math.abs(attacker.y - targetTile.y) != 1)
	{
		// Illegal attack (must be orthagonally adjacent)
		return;
	}
	if (targetTile.entities.length == 1)
	{
		var defender = targetTile.entities[0];
		var damage = Math.floor(Math.random() * 4) + 1;
		var defense = 0;
		if (damage > defense)
		{
			defender.HP -= damage + defense;
			if (defender.HP <= 0)
			{
				EntityDie(defender);
			}
		}
	}
}

function EntityDie (entity) {
	EffectDie(entity);
	var tile = entity.GetTile();
	tile.entities.splice(tile.entities.indexOf(entity), 1);
	entityList.splice(entityList.indexOf(entity), 1);
	//not needed because EffectDie() does it
	//DrawTileContent(entity);
}

function EntityLevelUp (entity) {
	EffectLevelUp(entity);
	entity.MAX_HP += 1;
}