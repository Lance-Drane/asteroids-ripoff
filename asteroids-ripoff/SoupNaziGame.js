/**
 * 
 */

//////////////////////////////NOTE://///////////////////////
//At present, I am trying to figure out how to have actual images drawn on the canvas without changing too many functions (in particular the function which handles ALL collisions).
//Functionality is otherwise complete, and placeholder rectangles are currently implemented for the player/enemies/collectibles.


//////////////////////////////////////////////////////////
/////////////////INTRODUCTORY TEXT////////////////////////
//////////////////////////////////////////////////////////

	var story = (
	"Welcome to the Soup Nazi's Nightmare!" + 
	"\n\nThe Soup Nazi (blue square) is trying to collect soups to serve to well behaving patrons, but not all is well..." + 
	"\nJerry Seinfeld, George Costanza, Elaine Benes, and Cosmo Kramer (red squares) are questioning his methodology, and must pay the price for their insolence!" + 
	"\n\nShoot loogies at each of the misbehaving patrons to convince them to leave the store, but watch out!" + 
	"\nIf one of them touches you, you'll lose a soup recipe!" + 
	"\nIf you lose 5 or more soup recipes, it's game over!" + 
	"\nCollecting enough soup (green squares) will add unique recipes!" + 
	"\n\nYour score is based on how many soups you collect for the worthy patrons!"
	);

	var controls = (
	"CONTROLS: " + 
	"\n\nMOVE UP: up" + 
	"\nMOVE LEFT: left" + 
	"\nMOVE DOWN: down" + 
	"\nMOVE RIGHT: right" + 
	"\n\nNOTE: you can only fire in one direction at a time, but you only need to press an aim key once to change the direction" + 
	"\n\nAIM UP: W" +
	"\nAIM LEFT: A" +
	"\nAIM DOWN: S" +
	"\nAIM RIGHT: D" +
	"\nFIRE: spacebar"
	);
	
	alert (story);
	alert(controls);
	
///////////////////////////////////////////////////////////
////////////////////////CANVAS VARIABLES////////////////////
///////////////////////////////////////////////////////////

/*
NOTE: These two variables do not determine the display of the canvas (that's determined in the CSS file), but determine the relative position of 
the other variables. 	
*/
var CANVAS_WIDTH = 500;
var CANVAS_HEIGHT = 500;

//The canvas itself and its context
var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
                      "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');

//for smoother animation; if you want the game to move faster, change the FPS var to a higher value
var FPS = 30;
//The function which constantly updates and redraws the canvas
setInterval(function() {
  update();
  draw();
}, 1000/FPS);

//////////////////////////////////////////////////////
/////////////CONSTANTS//////////////////////////
//////////////////////////////////////////////////////

var SOUP_SPAWN = 5; //spawn rate of soup
var STARTING_RECIPES = 10;
var itemWidth = 20; //width of each item in canvas
var itemHeight = 25; //height of each item in canvas	
var DEFAULT_ENEMY_SPAWN_RATE = .1;

/////////////////////////////////////////////////
////////////HEADING VARIABLES////////////////////
/////////////////////////////////////////////////

var score = 0;
var recipes = STARTING_RECIPES;

var extraLife = 0;

var music = document.getElementById("soundTrack");
//append information to h4 text

	$('#recipes').text(recipes);
	$('#score').text(score);
music.play();

var finishSound = document.getElementById("YoureThroughSoupNazi");
//fix this
finishSound.ontimeupdate = function() {stopFinishSound()};

//fix this
function stopFinishSound() {
	if(finishSound.currentTime >= 54)
		finishSound.pause();
}

function handleFinishSound() {
	finishSound.currentTime = 40;
	finishSound.play();				
}

//////////////////////////////////////////////////////////////
////////////////////////PLAYER////////////////////////////////
//////////////////////////////////////////////////////////////

//define the player here

/*
var player = new Image();
player.onload = function() {
  player.x = (CANVAS_WIDTH/2 - itemWidth);
  player.y = (CANVAS_HEIGHT/2 - itemHeight);
  player.width = itemWidth;
  player.height = itemHeight;
  draw: function() {
	canvas.fillRect(player, this.x, this.y, this.width, this.height);
  };
}
player.src = "soupNaziCropped50width.png";
*/

var player = {
  color: "#00A",
  x: (CANVAS_WIDTH/2 - itemWidth), //center
  y: (CANVAS_HEIGHT/2 - itemHeight), //center
  width: itemWidth,
  height: itemHeight,
  draw: function() {
    canvas.fillStyle = this.color;
    canvas.fillRect(this.x, this.y, this.width, this.height);
  }
};

var playerBullets = []; //create bullets which come from the player


///////////////////////////////////////
//////////ENEMY SPAWN RATES//////////////////
///////////////////////////////////////

//make game progressively more difficult

var enemySpawnRate = DEFAULT_ENEMY_SPAWN_RATE;
var timerEnemySpawn = setInterval(enemyTimer, 10000);

function enemyTimer() {
	enemySpawnRate = enemySpawnRate + .01;
	if (enemySpawnRate >= DEFAULT_ENEMY_SPAWN_RATE + .1)
	{
		enemySpawnRate = DEFAULT_ENEMY_SPAWN_RATE;
	}
}


///////////////////////
//FIRE DIRECTION///////
///////////////////////
var fireDirection = "UP"; //default setting

$(window).keydown(function(e) {
		switch(e.keyCode) {
		case 65: //left, A
		fireDirection = "LEFT";
		$('#direction').attr("src","computer_key_Arrow_Left.png");
		break;
		case 87: //up, W
		fireDirection = "UP";
		$('#direction').attr("src","computer_key_Arrow_Up.png");
		break;
		case 68: //right, A
		fireDirection = "RIGHT";
		$('#direction').attr("src","computer_key_Arrow_Right.png");
		break;
		case 83: //down, S
		fireDirection = "DOWN";
		$('#direction').attr("src","computer_key_Arrow_Down.png");
		break;
		case 191: // / character
				alert (story);
				alert(controls);
				  keydown.space = false;
				  keydown.left = false;
				  keydown.up = false;
				  keydown.right = false;
				  keydown.down = false;
		break;		  
		}
	});

	
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////CONTINUOUS FUNCTIONS////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

//Restrict element to canvas (no part of their image outside of canvas); used for player and collectible
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

//constantly update actions of all variables
function update() {

  if (keydown.space) {
    player.shoot();
  }
  
  if (keydown.left) {
    player.x -= 5;
  }

  if (keydown.right) {
    player.x += 5;
  }
  
  if (keydown.up) {
    player.y -= 5;
  }

  if (keydown.down) {
    player.y += 5;
  }
  
  //Keep 100% of the player character bound inside the canvas
  player.x = player.x.clamp(0, CANVAS_WIDTH - player.width);
  player.y = player.y.clamp(0, CANVAS_HEIGHT - player.height);
  
   playerBullets.forEach(function(bullet) {
    bullet.update();
  });

  playerBullets = playerBullets.filter(function(bullet) {
    return bullet.active;
  });
  
  enemies.forEach(function(enemy) {
    enemy.update();
  });

  enemies = enemies.filter(function(enemy) {
    return enemy.active;
  });

  
  //spawn rate of enemy, higher number causes more frequent spawns
  if(Math.random() < enemySpawnRate) {
    enemies.push(Enemy());
  } 
  
  
  collectibles.forEach(function(collectible) {
	collectible.update();
  });
  
  
  collectibles = collectibles.filter(function(collectible) {
	return collectible.active;
  });
  
  //only allow a maximum number of collectibles to exist at once
  if(collectibles.length < SOUP_SPAWN) {
    collectibles.push(Collectible());
  } 
  
  handleCollisions();
  
}

//makes everything VISIBLE on the canvas; all other functionality is technically handled in the update function
function draw() {
  canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); //first, remove the previous drawing, then draw each element
  player.draw();
  
  playerBullets.forEach(function(bullet) {
  bullet.draw();
	});
	
  enemies.forEach(function(enemy) {
    enemy.draw();
  });
  
  collectibles.forEach(function(collectible) {
	collectible.draw();
  });
}

//////////////////////////////////////////////////////////////////////////////////
/////////////////////////////PROJECTILE FUNCTIONS/////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

function Bullet(I) {
  I.active = true;

  if (fireDirection == "LEFT")
  {
	  I.xVelocity = -I.speed;
	  I.yVelocity = 0;
  }
  
  if (fireDirection == "UP")
  {
	  I.xVelocity = 0;
	  I.yVelocity = -I.speed;
  }
  
  if (fireDirection == "RIGHT")
  {
	  I.xVelocity = I.speed;
	  I.yVelocity = 0;
  }
  
  if (fireDirection == "DOWN")
  {
	  I.xVelocity = 0;
	  I.yVelocity = I.speed;
  }
  
  I.width = 3;
  I.height = 3;
  /*I.color = "#000";*/
  /*I.color = "#FFA500";*/
  I.color = "#00E5EE";

  I.inBounds = function() {
    return I.x >= 0 && I.x <= CANVAS_WIDTH &&
      I.y >= 0 && I.y <= CANVAS_HEIGHT;
  };

  I.draw = function() {
    canvas.fillStyle = this.color;
    canvas.fillRect(this.x, this.y, this.width, this.height);
  };

  I.update = function() {
    I.x += I.xVelocity;
    I.y += I.yVelocity;

    I.active = I.active && I.inBounds();
  };

  return I;
}

player.shoot = function() {
  var bulletPosition = this.midpoint();

  playerBullets.push(Bullet({
    speed: 10, //higher numbers indicate faster projectile speed
	//note that if speed is too low and/or player movement variable is too high, you can move as fast or faster than the projectile, which is not desirable
    x: bulletPosition.x,
    y: bulletPosition.y
  }));
};

player.midpoint = function() {
  
  if (fireDirection == "LEFT")
	  return {
		x: this.x,
		y: this.y + this.height/2
		//y: this.y + this.height/2
	  };
  if (fireDirection == "UP")
	  return {
		x: this.x + this.width/2,
		y: this.y
		//y: this.y + this.height/2
	  };
  if (fireDirection == "RIGHT")
	  return {
		x: this.x + this.width,
		y: this.y + this.height/2
		//y: this.y + this.height/2
	  };
  if (fireDirection == "DOWN")
	  return {
		x: this.x + this.width/2,
		y: this.y + this.height
		//y: this.y + this.height/2
	  };
};

////////////////////////////////////////////////////////////////////
/////////////////////ENEMY FUNCTIONS////////////////////////////////
////////////////////////////////////////////////////////////////////

  enemies = [];  //where all enemies will be stored
  
function Enemy(I) {
  
  //create two variables with two possible values each to help determine spawn location
  //the actual values of the two numbers don't matter
  var xSpawn = Math.random() < .5 ? 0 : CANVAS_WIDTH;
  var ySpawn = Math.random() < .5 ? 0 : CANVAS_HEIGHT;
  
  I = I || {};

  I.active = true; //when this is false, this specific enemy disappears
  
  I.age = Math.floor(Math.random() * 128);

  I.color = "#FF0000";
  //I.color = "#A2B";

  if(xSpawn == 0 && ySpawn == 0) //spawn on the left, send rightwards
  {
  I.x = 0; //spawn location
  I.y = CANVAS_HEIGHT / 4 + Math.random() * CANVAS_HEIGHT / 2;
  I.xVelocity = 2;
  I.yVelocity = 0; 
  }
  if(xSpawn == CANVAS_WIDTH && ySpawn == 0) //spawn on the top, send downwards
  {
  I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2; //spawn location
  I.y = 0; //spawn location
  I.xVelocity = 0;
  I.yVelocity = 2; 
  }
  if(xSpawn == 0 && ySpawn == CANVAS_HEIGHT) //spawn on the right, send leftwards
  {
  I.x = CANVAS_WIDTH; //spawn location
  I.y = CANVAS_HEIGHT / 4 + Math.random() * CANVAS_HEIGHT / 2; //spawn location
  I.xVelocity = -2;
  I.yVelocity = 0; 
  }
  if(xSpawn == CANVAS_WIDTH && ySpawn == CANVAS_HEIGHT)//spawn on the bottom, send upwards
  {
  I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2; //spawn location
  I.y = CANVAS_HEIGHT; //spawn location
  I.xVelocity = 0;
  I.yVelocity = -2; 
  }
  
  
  I.width = itemWidth;
  I.height = itemHeight;

  //returns a boolean value
  I.inBounds = function() {
    return I.x >= 0 && I.x <= CANVAS_WIDTH &&
      I.y >= 0 && I.y <= CANVAS_HEIGHT;
  };

  
  //continually redraw the sprite
  I.draw = function() {
    canvas.fillStyle = this.color;
    canvas.fillRect(this.x, this.y, this.width, this.height);
  };
  
  I.update = function() {
    I.x += I.xVelocity;
    I.y += I.yVelocity;

	//change pathing to zigzag away from spawn
	if (xSpawn == CANVAS_WIDTH)
    I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);
	if (xSpawn == 0)
	I.yVelocity = 3 * Math.cos(I.age * Math.PI / 64);
    I.age++; 

	//If enemy is not in bounds, remove from play
    I.active = I.active && I.inBounds();
  };

  //function to delete enemy
  I.explode = function() {
    this.active = false;
    
  };
  
  return I;
};

//////////////////////////////////////////////////////////
/////////////////////////////COLLECTABLES/////////////////
//////////////////////////////////////////////////////////

collectibles = []; //where each collectible will be stored

function Collectible(I) {

  I = I || {};
  
  //create a timer: if a certain amount of time has passed, delete the object (useful in case the object spawns in an awkward location) and restart timer	  
  var timerProjCount = 0;
  
  I.active = true;
  
  I.color = "#00ff00"; //
  
  I.x = Math.floor(Math.random() * CANVAS_WIDTH - itemWidth) ;
  I.y = Math.floor(Math.random() * CANVAS_HEIGHT - itemHeight);
  
  I.width = itemWidth;
  I.height = itemHeight;

  
  
  //keep collectibles from spawning outside of the boundaries
  I.x = I.x.clamp(0, CANVAS_WIDTH - I.width);
  I.y = I.y.clamp(0, CANVAS_HEIGHT - I.height);
  
  I.inBounds = function() {
    return I.x >= 0 && I.x <= CANVAS_WIDTH &&
    I.y >= 0 && I.y <= CANVAS_HEIGHT;
  };

  
  
  I.draw = function() {
    canvas.fillStyle = this.color; //
	//canvas.fillStyle = 'soup50width.png';
    canvas.fillRect(this.x, this.y, this.width, this.height); //
	//canvas.drawImage(I, 400, 400, I.width, I.height); //
  };

  I.update = function() {

  //after a certain amount of time has passed after specific collectible has spawned, delete the image (it may be in a poor location to reach)
  timerProjCount++;
  if (timerProjCount == 500) { //timerProjCount == number of seconds
	  this.active = false;
	  timerProjCount = 0;
  }
  
  };

  //delete collectible
  I.explode = function() {
	this.active = false;

  };
  
  return I;
};

//////////////////////////////////////////////////////////
///////////////////////COLLISIONS////////////////////////
/////////////////////////////////////////////////////////


/////////////BASIC COLLISION FORMULA/////////////////////////
function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

//////////////////////////////////////////////////
/////////////SPECIFIC COLLISIONS//////////////////////////
////////////////////////////////////////////////





function handleCollisions() {
  playerBullets.forEach(function(bullet) {
    enemies.forEach(function(enemy) {
      if (collides(bullet, enemy)) {
        enemy.explode();
        bullet.active = false;

      }
    });
  });

  enemies.forEach(function(enemy) {
    if (collides(enemy, player)) {
      enemy.explode();
      player.explode();
    }
  });
  
  collectibles.forEach(function(collectible) {
	if (collides(collectible, player)) {
		collectible.explode();
		
		//append variables here
		score = score + 100;
		$('#score').text(score);
		extraLife = extraLife + 100;
		
		//update extra life function
		if (extraLife >= 5000) //use >= instead of == in case score is incremented too fast
		{
		recipes = recipes + 1;
		$('#recipes').text(recipes);
		extraLife = 0;
		}
	}
  });
  
  
}

//remove the player if 'life' is negated and handle 'life' negation
player.explode = function() {
  recipes = recipes - 1;
  $('#recipes').text(recipes);
  if (recipes <= 0) {	
    restart();	
	}
};

///////////////////////////////////////////////////////////
////////////////////////RESTART////////////////////////////
////////////////////////////////////////////////////////////

//run this function each time the player loses
function restart() {

  music.pause();
  music.currentTime = 0;
    //set any keydown to false, or else the main character will bug out and not respond to inputs (will keep applying input )
  handleFinishSound();
  
    keydown.space = false;
  keydown.left = false;
  keydown.up = false;
  keydown.right = false;
  keydown.down = false;
  
  alert("Oh, no! It looks like the Seinfeld characters have ruined yet another virtuous life. \nMaybe you'll do better on the rerun or the director's cut." + 
  "\n\nYOUR FINAL SCORE: " + score 
  );

  finishSound.pause();
  
  keydown.space = false;
  keydown.left = false;
  keydown.up = false;
  keydown.right = false;
  keydown.down = false;	
  
  //get rid of all enemies, projectiles, and collectibles currently on the screen
  
  playerBullets = playerBullets.filter(function(bullet) {
    return false;
  });

  enemies = enemies.filter(function(enemy) {
    return false;
  });
  
  collectibles = collectibles.filter(function(collectible) {
	return false;
  });
  
 //respawn character at appropriate location
  player.x = (CANVAS_WIDTH/2 - itemWidth); 
  player.y = (CANVAS_HEIGHT/2 - itemHeight);
  
  //reset heading variables and append as appropriate
  score = 0;
  extraLife = 0;
  recipes = STARTING_RECIPES;
  enemySpawnRate = DEFAULT_ENEMY_SPAWN_RATE;
  $('#recipes').text(recipes);
  $('#score').text(score);

  music.play();
}