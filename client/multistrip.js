var lsp = require("./lsp");

function MultiStrip(strip_cfg) {
	this.strips = [];

	for (var c in strip_cfg)
		this.strips.push(new lsp(
			strip_cfg[c].ip,
			strip_cfg[c].port,
			strip_cfg[c]["length"],
			strip_cfg[c].arrangement,
			strip_cfg[c].fps
	));
}

MultiStrip.prototype.getMaxLength = function() {
	var maxlen = 0;
	for (var s in this.strips)
		if (this.strips[s].getLength() > maxlen)
			maxlen = this.strips[s].getLength();

	return maxlen;
}

MultiStrip.prototype.getMinLength = function() {
	var minlen = 0;
	for (var s in this.strips)
		if (minlen == 0 || this.strips[s].getLength() < minlen)
			minlen = this.strips[s].getLength();

	return minlen;
}

MultiStrip.prototype.setPixelAll = function(n, color) {
	for (var s in this.strips)
		this.strips[s].setPixel(n, color);
}

MultiStrip.prototype.setPixelSingle = function(stripid, n, color) {
	this.strips[stripid].setPixel(n, color);
}

MultiStrip.prototype.flip = function () {
	for (var s in this.strips)
		this.strips[s].flip();
}

MultiStrip.prototype.fillSingle = function(strip, color) {
	this.strips[strip].fill(color);
}

MultiStrip.prototype.fillAll = function(color) {
	for (var s in this.strips)
		this.strips[s].fill(color);
}

MultiStrip.prototype.clearAll = function(color) {
	this.fillAll();
}

MultiStrip.prototype.getStripNumber = function () {
	return this.strips.length;
}

MultiStrip.prototype.getStripLength = function(strip) {
	return this.strips[strip].getLength();
}

MultiStrip.prototype.getFrameBuffer = function () {
	var fb = [];

	for (var s in this.strips)
		fb.push(this.strips[s].getFrameBuffer());

	return fb;
}

module.exports = MultiStrip;
