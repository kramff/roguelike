// ADV_NET_3D
// Magic module
// Copyright Mark Foster 2013
// All Rights Reserved

// Takes the speaking entity and the text
function ProcessSpell (entity, text)
{
	if (entity == player && text == "SWITCH")
	{
		Cast_SWITCH();
	}
	return false; // No magic in this version

	var spArray = text.split(" ");
	var wordArray = [];
	for (var i = 0; i < spArray.length; i++)
	{
		if (spArray[i] != "")
		{
			wordArray.push(spArray[i]);
		}
	}
	if (wordArray.length != 3)
	{
		return false;
	}
	// If first word isn't all uppercase:
	if (wordArray[0] != wordArray[0].toUpperCase())
	{
		return false;
	}
	// If second "word" isn't a number:
	if (isNaN(wordArray[1]))
	{
		return false;
	}
	//figure out target from this string
	var target = wordArray[2];
	var power = parseInt(wordArray[1]);
	

	switch (wordArray[0])
	{
		case "FIREBALL":
			Debug("Cast FIREBALL");
			return "#FF4000";
		break;
		case "WALL":
			Debug("Cast WALL");
			return "#B08040";
		break;
		case "TELEPORT":
			Debug("Cast TELEPORT");
			return "#80FFFF";
		break;
			
		default:
			return false;
	}
}

function CheckMagicWord (text)
{
	if (text == "SWITCH")
	{
		return true;
	}



	return false; // No magic in this version
	
	var spArray = text.split(" ");
	var wordArray = [];
	for (var i = 0; i < spArray.length; i++)
	{
		if (spArray[i] != "")
		{
			wordArray.push(spArray[i]);
		}
	}
	if (wordArray.length < 1)
	{
		return false;
	}
	if (wordArray[0] != wordArray[0].toUpperCase())
	{
		return false;
	}
	

	switch (wordArray[0])
	{
		case "FIREBALL":
		case "WALL":
		case "TELEPORT":
			return true;
		break;
		
		default:
			return false;
	}
}