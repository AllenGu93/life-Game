var Map = function(canvasId, lines, columns, livingCells) {
	map = this;
	this.canvasId = canvasId;
	this.canvas = document.getElementById(this.canvasId);
	this.canvas.lineWidth = 1;
	this.context = this.canvas.getContext('2d');

	this.lines = Number(lines);
	this.columns = Number(columns);
	this.mapArray = new Array();
	this.dynamicArray = new Array();
	this.dieArray = new Array();
	this.adjustArray = new Array();
	this.mapSize = this.lines * this.columns;
	this.livingCells = livingCells <= this.mapSize ? livingCells : this.mapSize;
	this.cellWidth = this.cellHeight = null;
	this.mapWidth = 0;
	this.mapHeight = 0;
	this.loop = false;
	this.fastMode = false;

	this.requestAnimationFrameId = null;
	this.speed = 50;
	this.scale = 1;
	this.translateOriginX = this.translateOriginY = 0;
	//上一次拖动结束后map原点坐标相对上上次位置的偏移量
	this.translateX = this.translateY = 0;
	//相对于上次拖动后位置的偏移量
	this.scaleOriginX = this.scaleOriginY = 0;
	//上次缩放结束后缩放视野的原点坐标相对于上上次位置的偏移量

	/*
	 以可视区域中点开始渲染方案参数
	 */
	this.renderCenterX = this.renderCenterY = 0;
	//渲染区域中心点相对于map的绝对坐标
	this.mapCenterX = this.mapCenterY = 0;
	//map中心点绝对坐标

	this.colorList = {
		dieCell : new Color('#D0D0D0'),
		livingCell : new Color('#FF6667'),
		border : new Color('#F7F7F7'),
		background : new Color('#D0D0D0'),
	}

	this.fps = 0;
	this.initialise = function() {
		for (var i = 0; i < this.lines; ++i) {
			this.mapArray[i] = new Array();
			for (var ii = 0; ii < this.columns; ++ii) {
				this.mapArray[ i ][ii] = {
					"position" : new Array(i, ii),
					"currentStatus" : 0,
					"nextStatus" : 0,
					"livingCellsAround" : 0,
					"livingCellsLifeAround" : 0,
					"opreated" : 0,
					"hp" : 0
				};
			}
		}
		var i = this.livingCells - 1;
		while (i >= 0) {
			var tempn1 = random(0, map.lines - 1);
			var tempn2 = random(0, map.columns - 1);
			if (!this.mapArray[ tempn1 ][tempn2]["currentStatus"]) {
				this.dynamicArray.push(map.mapArray[ tempn1 ][tempn2]);
				this.mapArray[ tempn1 ][tempn2]["currentStatus"] = 1;
				this.mapArray[ tempn1 ][tempn2]["hp"] = 255;
			} else
				++i;
			--i;
		}
		$("lines").value = this.lines;
		$("columns").value = this.columns;
		$("need_cells").value = this.livingCells;
		$("living_cells").value = this.livingCells;
		this.ajustCanvasSize()
	}
	this.allExecute = function() {
		this.dynamicArray.length = 0;
		this.dieArray.length = 0;
		for ( p = 0; p < this.lines; ++p) {
			for ( q = 0; q < this.columns; ++q) {
				cell = this.mapArray[p][q];
				i = cell.position[0];
				ii = cell.position[1];
				whichLine1 = (i + this.lines - 1) % this.lines;
				whichLine3 = (whichLine1 + 2) % this.lines;
				whichColumn1 = (ii + this.columns - 1) % this.columns;
				whichColumn3 = (whichColumn1 + 2) % this.columns;
				livingCellsLifeAround = this.mapArray[whichLine1][whichColumn1]["hp"] + this.mapArray[whichLine1][q]["hp"] + this.mapArray[whichLine1][whichColumn3]["hp"] + this.mapArray[p][whichColumn1]["hp"] + this.mapArray[p][whichColumn3]["hp"] + this.mapArray[whichLine3][whichColumn1]["hp"] + this.mapArray[whichLine3][q]["hp"] + this.mapArray[whichLine3][whichColumn3]["hp"];
				livingCellsAround = this.mapArray[whichLine1][whichColumn1]["currentStatus"] + this.mapArray[whichLine1][q]["currentStatus"] + this.mapArray[whichLine1][whichColumn3]["currentStatus"] + this.mapArray[p][whichColumn1]["currentStatus"] + this.mapArray[p][whichColumn3]["currentStatus"] + this.mapArray[whichLine3][whichColumn1]["currentStatus"] + this.mapArray[whichLine3][q]["currentStatus"] + this.mapArray[whichLine3][whichColumn3]["currentStatus"];

				if (cell["currentStatus"] == 1) {
					if ((livingCellsAround < 2 || livingCellsAround > 4) && cell["hp"] >= 1) {//繁殖条件不足 或 人口拥挤
						cell["hp"] = (cell["hp"] - 50) < 0 ? 0 : cell["hp"] -50;
						this.dynamicArray.push(cell);
					} else if (cell["hp"] < 1) {//死亡条件
						cell["hp"] = 0;
						this.dieArray.push(cell);
					} else {
						if (livingCellsAround == (4) && livingCellsLifeAround > 360) {//资源共享满足
							cell["hp"] =(cell["hp"] + 30)>255?255:cell["hp"] + 30;
						} else//自然衰老
							cell["hp"] = (cell["hp"] - 30)<0?0:cell["hp"] - 30;
						this.dynamicArray.push(cell);
					}
				} else if (cell["currentStatus"] == 0 && livingCellsAround == 3 && livingCellsLifeAround > 570) {//繁殖
					cell["hp"] = 255;
					this.dynamicArray.push(cell);
				}
			}
		}
		this.livingCells = this.dynamicArray.length;
		$("living_cells").value = this.livingCells;
		// this.context.fillStyle = this.colorList.background.hex;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// this.context.fillStyle = this.colorList.livingCell.hex;
		for ( i = 0; i < this.dynamicArray.length; ++i) {
			// this.context.fillStyle = "rgb(" +  this.dynamicArray[i]["hp"] + "," +255- this.dynamicArray[i]["hp"] + ",255)";
			this.context.fillStyle = "rgba(" + Math.abs(255 - this.dynamicArray[i]["hp"]) + "," + this.dynamicArray[i]["hp"] + ",0," + (this.dynamicArray[i]["hp"]) / 127 + ")";
			this.dynamicArray[i]["currentStatus"] = 1;
			this.context.fillRect(this.dynamicArray[i]["position"][1] * this.cellWidth + this.translateX, this.dynamicArray[i]["position"][0] * this.cellHeight + this.translateY, this.cellWidth, this.cellHeight);
		}
		// if (this.mapSize < 100000) {
		this.drawBorder();
		// }
		for ( i = 0; i < this.dieArray.length; ++i) {
			this.dieArray[i]["currentStatus"] = 0;
		}
	}
	this.execute = function() {
		k = this.dynamicArray.length - 1;
		while (k >= 0) {//通过存活队列生成调整队列
			cell = this.dynamicArray[k];
			if (!cell["opreated"]) {
				this.adjustArray.push(cell);
				cell["opreated"] = 1;
			}
			i = cell.position[0];
			ii = cell.position[1];
			whichLine1 = (i + this.lines - 1) % this.lines;
			whichLine3 = (whichLine1 + 2) % this.lines;
			whichColumn1 = (ii + this.columns - 1) % this.columns;
			whichColumn3 = (whichColumn1 + 2) % this.columns;
			position = [[whichLine1, whichColumn1], [whichLine1, ii], [whichLine1, whichColumn3], [i, whichColumn1], [i, whichColumn3], [whichLine3, whichColumn1], [whichLine3, ii], [whichLine3, whichColumn3]];
			for ( p = 0; p < 8; ++p) {
				this.mapArray[position[p][0]][position[p][1]]["livingCellsAround"] += 1;
				this.mapArray[position[p][0]][position[p][1]]["livingCellsLifeAround"] += cell["hp"];
				if (!this.mapArray[position[p][0]][position[p][1]]["opreated"]) {
					cell["livingCellsLifeAround"] += this.mapArray[position[p][0]][position [p][1]]["hp"];
					this.adjustArray.push(this.mapArray[position[p][0]][position[p][1]]);
					this.mapArray[position[p][0]][position[p][1]]["opreated"] = true;
				}
			}--k;
		}
		this.dynamicArray.length = 0;
		i = this.adjustArray.length - 1;
		while (i >= 0) {//通过调整队列生成下一步的存活队列
			this.adjustArray[i]["opreated"] = false;
			if (this.adjustArray[i]["currentStatus"]) {//当前为活细胞
				if ((this.adjustArray[i]["livingCellsAround"] < 2 || this.adjustArray[i]["livingCellsAround"] > 3) && this.adjustArray[i]["hp"] >= 1) {//周围没有充足活细胞且hp未为0
					this.adjustArray[i]["hp"] -= 10;
					this.adjustArray[i]["currentStatus"] = 1;
					this.dynamicArray.push(this.adjustArray[i]);
				} else if (this.adjustArray[i]["hp"] < 1) {//活细胞hp为0
					this.adjustArray[i]["hp"] = 0;
					this.adjustArray[i]["currentStatus"] = 0;
				} else {
					if (this.adjustArray[i]["livingCellsAround"] == 3 && this.adjustArray[i]["livingCellsLifeAround"] > 240) {
						this.adjustArray[i]["hp"] += 1;
					} else
						this.adjustArray[i]["hp"] -= 5;
					this.adjustArray[i]["currentStatus"] = 1;
					this.dynamicArray.push(this.adjustArray[i]);
				}
			} else if (!this.adjustArray[i]["currentStatus"] && this.adjustArray[i]["livingCellsAround"] == 3 && this.adjustArray[i]["livingCellsLifeAround"] > 270) {
				this.adjustArray[i]["hp"] = 100;
				this.adjustArray[i]["currentStatus"] = 1;
				this.dynamicArray.push(this.adjustArray[i]);
			}
			this.adjustArray[i]["livingCellsAround"] = 0;
			this.adjustArray[i]["livingCellsLifeAround"] = 0; --i;
		}
		this.adjustArray.length = 0;
		this.livingCells = this.dynamicArray.length;
	}
	this.scaleMap = function(scale) {
		/*
		TODO 修改为以鼠标为中心缩放
		*/
		// if (!mouseNoMove) {
		// mouseMove = false;
		// }
		if (scale > 0 && this.scale < this.mapSize / 1000) {
			this.scale += 0.1
		} else if (scale < 0) {
			if (this.scale > 1) {
				this.scale -= 0.1;
			}
		}
		this.scale = Number(this.scale.toFixed(2));
		this.ajustMapSize();
		this.render();
		// mouseMove = true;
		$("scale").innerHTML = this.scale + "/" + this.mapSize / 1000;
	}
	this.quick = function() {
		if (this.speed > 50) {
			this.loop = false;
			window.cancelAnimationFrame(game.map.requestAnimationFrameId);
			window.clearInterval(game.intervalNumber);
			this.speed -= 10;
			game.intervalNumber = window.setInterval(map.draw, map.speed);
		}
	}
	this.reduce = function() {
		this.loop = false;
		window.cancelAnimationFrame(game.map.requestAnimationFrameId);
		window.clearInterval(game.intervalNumber);
		this.speed += 10;
		game.intervalNumber = setInterval(map.draw, map.speed);
	}
	this.ajustMapSize = function() {
		if (this.canvas.height / this.lines > this.canvas.width / this.columns) {
			this.cellWidth = this.cellHeight = (this.canvas.width / this.columns) * this.scale;
		} else {
			this.cellWidth = this.cellHeight = (this.canvas.height / this.lines) * this.scale;
		}
		this.mapWidth = this.columns * this.cellWidth;
		this.mapHeight = this.lines * this.cellWidth;
		this.mapCenterX = this.mapWidth / 2;
		this.mapCenterY = this.mapHeight / 2;
	}
	this.ajustCanvasSize = function() {
		var width = window.innerWidth / 2;
		var height = window.innerHeight;
		this.canvas.width = width;
		this.canvas.height = height;
		this.ajustMapSize();
		if (this.canvas.height / this.lines > this.canvas.width / this.columns) {
			this.canvas.height = this.cellHeight * this.lines
		} else {
			this.canvas.width = this.cellWidth * this.columns;
		}

		this.renderCenterX = this.canvas.width / 2;
		this.renderCenterY = this.canvas.height / 2;

	}
	this.draw = function() {
		if (!map.livingCells) {
			game.stop();
		}
		$("living_cells").value = map.livingCells;
		if (0) {
			// if (map.livingCells < 20000) {
			map.execute();
			map.render();
		} else {
			map.allExecute();
		}++map.fps;
		/*
		 TODO 增加速度控制
		 */
		if (map.loop)
			this.requestAnimationFrameId = window.requestAnimationFrame(game.map.draw);
	}
	this.render = function() {
		/*
		 TODO 拖动时，防止移出棋盘
		 */
		$("living_cells").value = this.livingCells;
		// this.context.fillStyle = this.colorList.background.hex;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		i = this.dynamicArray.length - 1;
		this.context.fillStyle = this.colorList.livingCell.hex;
		// this.context.beginPath();
		while (i >= 0) {
			// this.context.globalAlpha = this.dynamicArray[i]["hp"] / 100;
			this.context.fillStyle = "rgba(" + Math.abs(255 - this.dynamicArray[i]["hp"]) + "," + this.dynamicArray[i]["hp"] + ",0," + (this.dynamicArray[i]["hp"]) / 127 + ")";

			this.context.fillRect((this.dynamicArray[i].position[1]) * this.cellWidth + this.translateX, this.dynamicArray[i].position[0] * this.cellHeight + this.translateY, this.cellWidth, this.cellHeight);
			--i;
		}
		// this.context.fill()
		// if (this.livingCells < 100000) {
		this.drawBorder();
		// }
	}
	this.drawBorder = function() {
		this.context.globalAlpha = 1;
		this.context.strokeStyle = this.colorList.border.hex;
		this.context.lineWidth = "1";
		this.context.beginPath();
		i = this.lines;
		while (i >= 0) {
			this.context.moveTo(0 + this.translateX, i * this.cellHeight + this.translateY);
			this.context.lineTo(this.columns * this.cellWidth + this.translateX, i * this.cellHeight + this.translateY);
			--i;
		}
		i = this.columns;
		while (i >= 0) {
			this.context.moveTo(i * this.cellWidth + this.translateX, 0 + this.translateY);
			this.context.lineTo(i * this.cellHeight + this.translateX, this.lines * this.cellHeight + this.translateY);
			--i;
		}
		this.context.stroke();
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
