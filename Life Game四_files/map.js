var Map = function(canvasId, lines, columns, livingCells) {
	map = this;
	this.canvasId = canvasId;
	this.canvas = document.getElementById(this.canvasId);
	this.context = this.canvas.getContext('2d');

	this.lines = parseInt(lines);
	this.columns = parseInt(columns);
	this.mapArray = new Array();
	this.dynamicArray = new Array();
	this.adjustArray = new Array();
	this.mapSize = this.lines * this.columns;
	this.livingCells = livingCells <= this.mapSize ? livingCells : this.mapSize;
	this.cellWidth = this.cellHeight = null;
	this.mapWidth = 0;
	this.mapHeight = 0;

	// this.stats = new Stats();
	// this.stats.domElement.style.position = 'absolute';
	// this.stats.domElement.style.top = '0px';
	// this.stats.domElement.style.left = '0px';
	// $("canvas").appendChild(this.stats.domElement);
	// addEvent("stats", "mouseover", function() {
		// if (this.style["left"] == "0px"){
			// this.style["left"] = "auto";
			// this.style["right"] ="0px";
		// }else if(this.style["right"] == "0px"){
			// this.style["right"] = "auto";
			// this.style["left"] ="0px";
		// }
	// });

	this.colorList = {
		dieCell : new Color('#D0D0D0'),
		livingCell : new Color('#FF6667'),
		border : new Color('#EBEBEB'),
		background : new Color('#D0D0D0')
	}

	this.fps = 0;
	this.initialise = function() {
		for (var i = 0; i < this.lines; ++i) {
			this.mapArray[i] = new Array();
			for (var ii = 0; ii < this.columns; ++ii) {
				this.mapArray[ i ][ii] = new Cell(new Vector2(i, ii), 0, 0);
			}
		}
		var i = this.livingCells - 1;
		while (i >= 0) {
			var tempn1 = random(0, map.lines - 1);
			var tempn2 = random(0, map.columns - 1);
			if (!this.mapArray[ tempn1 ][tempn2].currentStatus) {
				this.dynamicArray.push(map.mapArray[ tempn1 ][tempn2]);
				this.mapArray[ tempn1 ][tempn2].currentStatus = 1;
			} else
				++i;
			--i;

		}
		$("lines").value = this.lines;
		$("columns").value = this.columns;
		$("need_cells").value = this.livingCells;
		$("living_cells").value = this.livingCells;
		this.ajustMapSize();
	}
	this.execute = function() {
		this.adjustArray.length = 0;
		k = this.dynamicArray.length - 1;
		while (k >= 0) {
			cell = this.dynamicArray[k];
			if (!cell.opreated) {
				this.adjustArray.push(cell);
				cell.opreated = 1;
			}
			i = cell.position.x;
			ii = cell.position.y;
			whichLine1 = (i + this.lines - 1) % this.lines;
			whichLine3 = (i + this.lines + 1) % this.lines;
			whichColumn1 = (ii + this.columns - 1) % this.columns;
			whichColumn3 = (ii + this.columns + 1) % this.columns;
			position = [[whichLine1, ii], [i, whichColumn1], [i, whichColumn3], [whichLine3, ii]];
			for ( p = 0; p < 4; ++p) {++this.mapArray[position[p][0]][position[p][1]].livingCellsAround;
				if (!this.mapArray[position[p][0]][position[p][1]].opreated) {
					this.adjustArray.push(this.mapArray[position[p][0]][position[p][1]]);
					this.mapArray[position[p][0]][position[p][1]].opreated = 1;
				}
			}--k;
		}
		this.dynamicArray.length = 0;
		i = this.adjustArray.length - 1;
		while (i >= 0) {
			this.adjustArray[i].opreated = 0;
			if (this.adjustArray[i].livingCellsAround == 3) {
				this.adjustArray[i].currentStatus = 1;
				// console.log(this.adjustArray[i].position.x + "," + this.adjustArray[i].position.y + "(" + this.adjustArray[i].currentStatus + "): " + this.adjustArray[i].livingCellsAround + "-> Living");
				this.dynamicArray.push(this.adjustArray[i]);
			} else if (this.adjustArray[i].currentStatus == 1 && (this.adjustArray[i].livingCellsAround < 2 || this.adjustArray[i].livingCellsAround > 3)) {
				this.adjustArray[i].currentStatus = 0;
				// console.log(this.adjustArray[i].position.x + "," + this.adjustArray[i].position.y + "(" + this.adjustArray[i].currentStatus + "): " + this.adjustArray[i].livingCellsAround + "-> Die");
			} else if (this.adjustArray[i].currentStatus == 1 && (this.adjustArray[i].livingCellsAround == 2 || this.adjustArray[i].livingCellsAround == 3)) {
				this.adjustArray[i].currentStatus = 1;
				this.dynamicArray.push(this.adjustArray[i]);
			} else {
				this.adjustArray[i].currentStatus = 0;
			}
			this.adjustArray[i].livingCellsAround = 0;
			--i;
		}
		this.livingCells = this.dynamicArray.length;
	}
	this.ajustMapSize = function() {
		var width = window.innerWidth / 2;
		var height = window.innerHeight;
		this.canvas.width = width;
		this.canvas.height = height;
		if (this.canvas.height / this.lines > this.canvas.width / this.columns)
			this.cellWidth = this.cellHeight = this.canvas.width / this.columns;
		else {
			this.cellWidth = this.cellHeight = this.canvas.height / this.lines;
		}
		this.mapWidth = this.columns * this.cellWidth;
		this.mapHeight = this.lines * this.cellWidth;
		this.canvas.width = this.columns * this.cellWidth;
		this.canvas.height = this.lines * this.cellHeight;
	}
	this.draw = function() {
		if (!map.livingCells) {
			game.stop();
		}
		$("living_cells").value = map.livingCells;
		map.execute();
		map.render();
		++map.fps;
		// map.stats.update();
	}
	this.render = function() {
		$("living_cells").value = this.livingCells;
		this.context.fillStyle = this.colorList.background.hex;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		i = this.dynamicArray.length - 1;
		while (i >= 0) {
			this.context.fillStyle = this.colorList.livingCell.hex;
			this.context.fillRect(this.dynamicArray[i].position.y * this.cellWidth, this.dynamicArray[i].position.x * this.cellHeight, this.cellWidth, this.cellHeight);
			--i;
		}
		if (this.mapSize < 100000) {
			this.context.strokeStyle = this.colorList.border.hex;
			this.context.lineWidth = "1";
			this.context.beginPath();
			i = this.lines + 1;
			while (i > 0) {
				this.context.moveTo(0, i * this.cellHeight);
				this.context.lineTo(this.columns * this.cellWidth, i * this.cellHeight); --i;
			}
			i = this.columns + 1;
			while (i > 0) {
				this.context.moveTo(i * this.cellWidth, 0);
				this.context.lineTo(i * this.cellHeight, this.lines * this.cellHeight); --i;
			}
			this.context.stroke();
		}
	}
	this.initialise();
	this.render();
}
var random = function(min, max) {
	return Math.round(Math.random() * (max - min ));
}
var random0_1 = function() {
	return Math.round(Math.random());
}
