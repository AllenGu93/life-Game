/**
 * @author Color
 */
function Color(r, g, b, a) {
	if ( typeof arguments[0] == typeof arguments[1] && typeof arguments[1] == typeof arguments[2] && typeof arguments[2] == "number") {
		this.r = Number(arguments[0]);
		this.g = Number(arguments[1]);
		this.b = Number(arguments[2]);
		for (var i = 0; i < 3; ++i) {
			this.hex = "#" + toHex2(this.r) + toHex2(this.g) + toHex2(this.b);
		}
		if (arguments.length == 4) {
			this.alpha = arguments[3];
		} else {
			this.alpha = 127;
		}
	} else if ( typeof arguments[0] == "string") {
		this.hex = arguments[0];
		if (this.hex.length == 3) {
			var str = this.hex.split("");
			this.hex = "0" + str[0] + "0" + str[1] + "0" + str[2];
		} else if (this.hex.length == 6) {
			this.hex = "#" + this.hex;
		}
		this.r = toDec2(this.hex[1] + this.hex[2]);
		this.g = toDec2(this.hex[3] + this.hex[4]);
		this.b = toDec2(this.hex[5] + this.hex[6]);
		if (arguments.length == 2) {
			this.alpha = arguments[3];
		} else {
			this.alpha = 127;
		}
	}
	function toDec2(){
		return parseInt(this,16);
	}
	function toHex2 () {
	if (String(this).length == 1)
		return "0" + parseInt(this,16);
	else
		return parseInt(this,16);
}
};
Color.prototype = {
	// copy : function() {
		// return new Color(this.r, this.g, this.b);
	// },
	// add : function(c) {
		// return new Color(this.r + c.r, this.g + c.g, this.b + c.b);
	// },
	// multiply : function(s) {
		// return new Color(this.r * s, this.g * s, this.b * s);
	// },
	// modulate : function(c) {
		// return new Color(this.r * c.r, this.g * c.g, this.b * c.b);
	// },
	// saturate : function() {
		// this.r = Math.min(this.r, 1);
		// this.g = Math.min(this.g, 1);
		// this.b = Math.min(this.b, 1);
	// }
};

// Color.black = new Color(0, 0, 0);
// Color.white = new Color(255, 255, 255);
// Color.red = new Color(255, 0, 0);
// Color.green = new Color(0, 255, 0);
// Color.blue = new Color(0, 0, 255);
// Color.yellow = new Color(255, 255, 0);
// Color.cyan = new Color(0, 255, 255);
// Color.purple = new Color(255, 0, 255);
