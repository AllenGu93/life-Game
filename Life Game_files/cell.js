var Cell = function(position, currentStatus, nextStatus) {
	this.position = position;
	this.currentStatus = currentStatus;
	// this.nextStatus = nextStatus;
	// this.color = this.currentStatus? "#FF6667" : "#D0D0D0";
	this.livingCellsAround = 0;
	this.opreated = 0;
}
