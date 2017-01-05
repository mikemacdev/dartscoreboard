// Game Model //

function Slice(number,str) {
	this.number = number;
	this.str = str;
	this.hits = 0;

	this.isClosed = function() {
		return (this.hits >= 3);
	}

	this.displayString = function() {
		var result = "";
		for (var i = 0; i < this.hits; i++) {
			result += "X";
		}
		return result;
	}

	this.customToString = function() {
		var result = this.str + ": " + this.displayString() + "\n";
		return result;
	}

	this.copy = function() {
		var result = new Slice(this.number,this.str);

		result.hits = this.hits;

		return result;
	}
}

function Player() {
	this.score = 0;
	this.twenty = new Slice(20,"20");
	this.nineteen = new Slice(19,"19");
	this.eighteen = new Slice(18,"18");
	this.seventeen = new Slice(17,"17");
	this.sixteen = new Slice(16,"16");
	this.fifteen = new Slice(15,"15");
	this.bullseye = new Slice(25,"BE");

	this.addHit = function(sliceName) {
		if (this[sliceName].isClosed()) {
			this.score += this[sliceName].number;
		} else {
			this[sliceName].hits++;
		}
	}

	this.hasClosedEverything = function() {
		return (this.twenty.isClosed() &&
				this.nineteen.isClosed() &&
				this.eighteen.isClosed() &&
				this.seventeen.isClosed() &&
				this.sixteen.isClosed() &&
				this.fifteen.isClosed() &&
				this.bullseye.isClosed());
	}

	this.customToString = function(number) {
		var result = "-- Player " + number + " --\n";
		result += "Score: " + this.score + "\n";
		result += this.twenty.customToString();
		result += this.nineteen.customToString();
		result += this.eighteen.customToString();
		result += this.seventeen.customToString();
		result += this.sixteen.customToString();
		result += this.fifteen.customToString();
		result += this.bullseye.customToString();
		return result;
	}

	this.copy = function() {
		var result = new Player();

		result.score = this.score;

		result.twenty = this.twenty.copy();
		result.nineteen = this.nineteen.copy();
		result.eighteen = this.eighteen.copy();
		result.seventeen = this.seventeen.copy();
		result.sixteen = this.sixteen.copy();
		result.fifteen = this.fifteen.copy();
		result.bullseye = this.bullseye.copy();

		return result;
	}
}

function Game(numPlayers) {
	this.players = new Array(numPlayers);
	this.currentPlayer = 1;
	this.currentShot = 1;

	this.addShot = function(sliceName,multiplier) {
		// call helper
		this.addHit(sliceName,multiplier);

		// increment shot
		this.currentShot++;
		if (this.currentShot > 3) {
			this.currentShot = 1;

			// increment player
			this.currentPlayer++;
			if (this.currentPlayer > this.players.length) {
				this.currentPlayer = 1;
			}
		}
	}

	this.addHit = function(sliceName,multiplier) {
		// recursive end
		if (multiplier <= 0) return;

		// determine if slice is closed off
		var closedOff = true;
		for (var i = 0; i < this.players.length; i++) {
			if (!this.players[i][sliceName].isClosed()) {
				closedOff = false;
			}
		}

		// add hit for current player
		if (!closedOff) {
			this.players[this.currentPlayer - 1].addHit(sliceName);
		}

		// recursive call
		this.addHit(sliceName,multiplier - 1);
	}

	this.isGameOver = function() {
		// determine player with highest score
		var winnerIndex = 0;
		var highestScore = 0;
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].score > highestScore) {
				winnerIndex = i;
				highestScore = this.players[i].score;
			}
		}

		return this.players[winnerIndex].hasClosedEverything();
	}

	this.customToString = function() {
		var result = "Current Player: " + this.currentPlayer + "\n";
		result += "Current Shot: " + this.currentShot + "\n";
		for (var i = 0; i < this.players.length; i++) {
			result += "\n" + this.players[i].customToString(i + 1);
		}
		return result;
	}

	this.copy = function() {
		var result = new Game(this.players.length);

		for (var i = 0; i < this.players.length; i++) {
			result.players[i] = this.players[i].copy();
		}

		result.currentPlayer = this.currentPlayer;
		result.currentShot = this.currentShot;

		return result;
	}

	// initialize players array
	for (var i = 0; i < this.players.length; i++) {
		this.players[i] = new Player();
	}
}

// Controller Functions //

function columnFromPlayer(player) {
	var result;
	switch (player) {
		case 1:
			result = 0;
			break;
		case 2:
			result = 3;
			break;
		case 3:
			result = 1;
			break;
		case 4:
			result = 4;
			break;
		default:
			result = 0;
	}
	return result;
}

function enableUndoButton(enable) {
	undoUsed = !enable;

	if (undoUsed) {
		document.getElementById("undoButton").style.backgroundColor = "#aaaaaa";
	}
	else {
		document.getElementById("undoButton").style.backgroundColor = "#ff8844";
		undoGame = game.copy();
	}
}

function resetScoreboard() {
	game = new Game(numPlayers);
	undoGame = new Game(numPlayers);

	enableUndoButton(false);

	// clear hit cells
	for (var r = 1; r < 8; r++) {
		tableRows[r].cells[0].innerHTML = "";
		tableRows[r].cells[1].innerHTML = "";
		tableRows[r].cells[3].innerHTML = "";
		tableRows[r].cells[4].innerHTML = "";
	}

	// clear scores
	tableRows[8].cells[0].innerHTML = "0";
	tableRows[8].cells[1].innerHTML = "0";
	tableRows[8].cells[2].innerHTML = "---Score---";
	tableRows[8].cells[3].innerHTML = "0";
	tableRows[8].cells[4].innerHTML = "0";

	updateColumnColors();
}

function updateColumnColors() {
	var currentCol = columnFromPlayer(game.currentPlayer);

	for (var r = 0; r < 9; r++) {
		for (var c = 0; c < 5; c++) {
			if (c == 2) {
				continue;
			}

			if (c == currentCol) {
				tableRows[r].cells[c].style.backgroundColor = "#ffff44";
			}
			else {
				if (c == 1 && game.players.length < 3) {
					tableRows[r].cells[c].style.backgroundColor = "#aaaaaa";
				}
				else if (c == 4 && game.players.length < 4) {
					tableRows[r].cells[c].style.backgroundColor = "#aaaaaa";
				}
				else {
					tableRows[r].cells[c].style.backgroundColor = "#ffffff";
				}
			}
		}
	}
}

function updatePlayerScore(playerNum) {
	var column = columnFromPlayer(playerNum);
	var player = game.players[playerNum - 1];

	tableRows[1].cells[column].innerHTML = player.twenty.displayString();
	tableRows[2].cells[column].innerHTML = player.nineteen.displayString();
	tableRows[3].cells[column].innerHTML = player.eighteen.displayString();
	tableRows[4].cells[column].innerHTML = player.seventeen.displayString();
	tableRows[5].cells[column].innerHTML = player.sixteen.displayString();
	tableRows[6].cells[column].innerHTML = player.fifteen.displayString();
	tableRows[7].cells[column].innerHTML = player.bullseye.displayString();

	tableRows[8].cells[column].innerHTML = player.score;
}

function displayGameOver(playerNum) {
	var winCol = columnFromPlayer(playerNum);

	for (var r = 0; r < 9; r++) {
		for (var c = 0; c < 5; c++) {
			if (c == 2) {
				if (r == 8) {
					tableRows[r].cells[c].innerHTML = "Player " + playerNum + " Wins!";
				}
				continue;
			}

			if (c == winCol) {
				tableRows[r].cells[c].style.backgroundColor = "#00ff00";
			}
			else {
				if (c == 1 && game.players.length < 3) {
					tableRows[r].cells[c].style.backgroundColor = "#aaaaaa";
				}
				else if (c == 4 && game.players.length < 4) {
					tableRows[r].cells[c].style.backgroundColor = "#aaaaaa";
				}
				else {
					tableRows[r].cells[c].style.backgroundColor = "#ff0000";
				}
			}
		}
	}
}

// Event Handlers //

function hitButtonClicked(sliceName,multiplier) {
	enableUndoButton(true);

	var shooter = game.currentPlayer;

	game.addShot(sliceName,multiplier);

	updatePlayerScore(shooter);

	if (game.isGameOver()) {
		displayGameOver(shooter);
	}
	else
	{
		updateColumnColors();
	}
}

function undoButtonClicked() {
	if (!undoUsed) {
		enableUndoButton(false);

		if (undoGame != 0) {
			game = undoGame.copy();
		}

		updateColumnColors();
		updatePlayerScore(game.currentPlayer);
	}
}

function newGameButtonClicked() {
	resetScoreboard();
}

function missButtonClicked() {
	enableUndoButton(true);
	game.addShot('miss',0);
	updateColumnColors();
}

function twoPsButtonClicked() {
	document.getElementById("twoPsButton").style.backgroundColor =   "#dddddd";
	document.getElementById("threePsButton").style.backgroundColor = "#aaaaaa";
	document.getElementById("fourPsButton").style.backgroundColor =  "#aaaaaa";
	numPlayers = 2;
}

function threePsButtonClicked() {
	document.getElementById("twoPsButton").style.backgroundColor =   "#aaaaaa";
	document.getElementById("threePsButton").style.backgroundColor = "#dddddd";
	document.getElementById("fourPsButton").style.backgroundColor =  "#aaaaaa";
	numPlayers = 3;
}

function fourPsButtonClicked() {
	document.getElementById("twoPsButton").style.backgroundColor =   "#aaaaaa";
	document.getElementById("threePsButton").style.backgroundColor = "#aaaaaa";
	document.getElementById("fourPsButton").style.backgroundColor =  "#dddddd";
	numPlayers = 4;
}

// Startup //

var tableRows = document.getElementById("scoreTable").rows;
var numPlayers = 4;
var game = 0;
var undoUsed = true;
var undoGame = 0;

resetScoreboard();