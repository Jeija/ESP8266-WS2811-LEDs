var dgram = require("dgram");
var path = require("path");
var fs = require("fs");

/**
 * LED Strip instance initialization
 * ip:			IP address of LED strip
 * port:		UDP port of LED strip
 * length:		Length of LED strip in pixels
 * arrangement:	"forwards", "backwards", "center"
 */
function LEDStrip(ip, port, length, arrangement, fps) {
	// Generate lookup table
	this.lookup = [];

	for (var n = 0; n < length; ++n) {
		if (arrangement == "forwards")
			this.lookup[n] = n;
		else if (arrangement == "backwards")
			this.lookup[n] = length - n;
		else if (arrangement == "center")
			this.lookup[Math.abs(length - 2 * n - 1 + (length - 2 * n <= 0 ? 1 : 0))] = n;
	}

	// Store properties
	this.pixels = length;
	this.port = port;
	this.ip = ip;

	// Generate empty framebuffer (front- and backbuffer)
	this.fb = {
		front : new Array(this.pixels),
		back : new Array(this.pixels)
	};
	this.clear();
	this.flip();
	
	// Open socket and output framebuffer regularly
	this.socket = dgram.createSocket("udp4");
	setInterval(this.output.bind(this), 1000 / fps);
}

/**
 * Prototype for writing the framebuffer to the LED strip by sending a UDP
 * MatrixProtocol data packet, called in a regular interval
 */
LEDStrip.prototype.output = function () {
	// Generate raw pixeldata buffer from framebuffer
	var pixeldata = new Buffer(this.pixels * 3);
	pixeldata.fill();
	for (var n = 0; n < this.pixels; n++) {
		var offset = this.lookup[n] * 3;
		pixeldata[offset + 0] = this.fb.front[n].red;
		pixeldata[offset + 1] = this.fb.front[n].green;
		pixeldata[offset + 2] = this.fb.front[n].blue;
	}

	// Generate UDP packet from header + pixeldata buffer
	var packetlen_h = (this.pixels - this.pixels % 0xff) / 0xff;
	var packetlen_l = this.pixels % 0xff;
	var packet_header = new Buffer([0x00, 0x00, 0x00, packetlen_h, packetlen_l]);
	var packet = Buffer.concat([packet_header, pixeldata]);

	// Send UDP packet to Matrix
	if (this.socket)
		this.socket.send(packet, 0, packet.length, this.port, this.ip);
};

/**
 * Set pixel in LED Strip to given color
 * n:		nth pixel of strip
 * color:	An object of {red = <val>, green = <val>, blue = <val>}
 * If n is larger than the strip length or negative, setPixel returns false, otherwise true
 */
LEDStrip.prototype.setPixel = function (n, color) {
	if (n >= this.pixels || n < 0) return false;
	this.fb.back[n] = color;
	return true;
};

/**
 * Fill backbuffer, set all pixels to given color
 * color:	The color to set for all pixels
 */
LEDStrip.prototype.fill = function (color) {
	for (var n = 0; n < this.pixels; n++)
		this.setPixel(n, color);
};

/**
 * Clear backbuffer, set all pixels to black
 */
LEDStrip.prototype.clear = function () {
	this.fill({red : 0, green : 0, blue : 0});
};

/**
 * Set backbuffer as new frontbuffer to render
 */
LEDStrip.prototype.flip = function () {
	for (var n = 0; n < this.pixels; n++) {
		if (this.fb.back[n]) {
			this.fb.front[n] = {
				red		: this.fb.back[n].red   || 0,
				green	: this.fb.back[n].green || 0,
				blue	: this.fb.back[n].blue  || 0
			};
		} else {
			this.fb.front[n] = {red : 0, green : 0, blue : 0};
		}
	}
};

/**
 * Returns length of LED Strip (derived from lookup table)
 */
LEDStrip.prototype.getLength = function () {
	return this.pixels;
};

/**
 * Returns (front) framebuffer of LED Strip (can be used for previews)
 */
LEDStrip.prototype.getFrameBuffer = function () {
	return this.fb.front;
};

module.exports = LEDStrip;
