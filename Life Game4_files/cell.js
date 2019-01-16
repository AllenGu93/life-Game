var Cell = function(position, currentStatus) {
	this.position = position;
	this.currentStatus = currentStatus;
	this.nextStatus = 0;
	this.livingCellsAround = 0;
	this.opreated = 0;
}
