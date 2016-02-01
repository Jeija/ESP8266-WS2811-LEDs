var SimplexNoise = require("simplex-noise");
var simplex = new SimplexNoise();

var INTERVAL_TIME = 0.01;
var BEAT_COEFF = 0.05;
var TIME_COEFF = 0.1;

var time, interval, ofs, beat;

function init (strips, settings) {
	beat = 0;
	ofs = 0;
	time = 0;

	interval = setInterval(function () {
		time += INTERVAL_TIME;
		ofs += beat * BEAT_COEFF;
		if (beat > 5 * INTERVAL_TIME) beat -= 5 * INTERVAL_TIME;
	}, INTERVAL_TIME * 1000);
}

function draw (strips) {
	for (var strip = 0; strip < strips.getStripNumber(); strip++) {
		for (var px = 0; px < strips.getStripLength(strip); px++) {
			var noise = simplex.noise2D(px/12, ofs + time * TIME_COEFF + strip * 5) * 127 + 128;
			strips.setPixelSingle(strip, px, {
				blue : noise,
				red : Math.max(200 - noise, 0),
				green : 255 - noise
			});
		}
	}
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	skynoise : {
		name : "Sky Noise",
		settings : {
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Simplex Noise, no special keys. Moves faster on beat."
	}
};
