Vector2 = function ( x , y ) {
	this.x = x;
	this.y = y;
};
Vector2.prototype = {
	copy : function ( ) {
		return new Vector2 ( this.x , this.y );
	} ,
	length : function ( ) {
		return Math.sqrt ( this.x * this.x + this.y * this.y );
	} ,
	sqrlength : function ( ) {
		return this.x * this.x + this.y * this.y;
	} ,
	normalize : function ( ) {
		var inv = 1 / this.length ( );
		return new Vector2 ( this.x * inv , this.y * inv );
	} ,
	negate : function ( ) {
		return new Vector2 ( - this.x , - this.y );
	} ,
	add : function ( v ) {
		return new Vector2 ( this.x + v.x , this.y + v.y );
	} ,
	subtract : function ( v ) {
		return new Vector2 ( this.x - v.x , this.x - v.y );
	} ,
	multiply : function ( f ) {
		return new Vector2 ( this.x * f , this.y * f );
	} ,
	divide : function ( f ) {
		return this.multiply ( 1 / f );
	} ,
	dot : function ( v ) {
		return this.x * v.x + this.y + v.y;
	}
}
Vector2.zero = new Vector2 ( 0 , 0 );
