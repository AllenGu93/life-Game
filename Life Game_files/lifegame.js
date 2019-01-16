function LifeGame(canvasId, lines, columns, livingCells) {
	game = this;
	this.speed = 100;
	this.map = new Map(canvasId, lines, columns, livingCells);
	this.intervalNumber = -1;
	
	$("speed").value = game.speed;

	window.onresize = function() {
		windowWidth = window.innerWidth / 2;
		windowHeight = window.innerHeight;
		game.map.canvas.width = windowWidth;
		game.map.canvas.height = windowHeight;
		game.map.context = game.map.canvas.getContext('2d');
		game.map.ajustMapSize();
		game.map.render();
	};
	this.createMap = function(canvasId, lines, columns, livingCells) {
		this.map = new Map(this.map.canvasId, lines, columns, livingCells);
		this.map.ajustMapSize();
		this.map.render();
	}
	this.clearMap = function() {
		this.map = new Map(this.map.canvasId, this.map.lines, this.map.columns, 0);

		this.map.draw();
	}
	this.startGame = function() {
		this.map.ajustMapSize();
		this.loop(this.speed);
		$("startTaggle").innerHTML = "Stop";
		$("world_status").innerHTML = "Start";
	}
	this.loop = function(speed) {
		this.map.render();
		this.intervalNumber = setInterval(game.map.draw, speed == null ? 100 : speed);
		// this.intervalNumber = setTimeout(game.loop, speed == null ? 100 : speed);
	}
	this.stop = function() {
		clearInterval(this.intervalNumber);
		// clearTimeout(this.intervalNumber);
		this.intervalNumber = -1;
		// this.map.render();
		$("startTaggle").innerHTML = "Start";
		$("world_status").innerHTML = "Stop";
	}
	this.changeCellStatus = function(cell) {
		if (cell.currentStatus) {
			cell.currentStatus = 0;
			var dynamicArrayLength = game.map.dynamicArray.length;
			for (var i = 0; i < dynamicArrayLength; ++i) {
				if (cell.position.x == game.map.dynamicArray[i].position.x && cell.position.y == game.map.dynamicArray[i].position.y) {
					this.map.dynamicArray.splice(i, 1);
					break;
				}
			}
		} else {
			cell.currentStatus = 1;
			this.map.dynamicArray.push(cell);
		}
		this.map.livingCells = game.map.dynamicArray.length;
		this.map.render();
	}
}
