var SimplexNoise = require("simplex-noise");
var parseColor = require("./parsecolor");
var simplex = new SimplexNoise();
var INTERVAL_TIME = 0.01;
var TIME_DIVISOR = 100;
var BEAT_TIME_COEFF = 0.6;
var RAINBOW_TIME_COEFF = 0.05;
var STRIP_DIFF_COEFF = 20;

var time, beat, interval, decay, color, time=0, density_divisor;

function init (strips, settings) {
	time = 0;
	beat = 0;

	color = settings.color;

	switch (settings.decay) {
		case "ultrafast": decay = 0.25; break;
		case "fast": decay = 0.15; break;
		case "normal": decay = 0.075; break;
		case "slow": decay = 0.025; break;
	}

	switch (settings.density) {
		case "low": density_divisor = 40; break;
		case "normal": density_divisor = 30; break;
		case "high": density_divisor = 20; break;
		case "higher": density_divisor = 10; break;
	}

	interval = setInterval(function () {
		time += INTERVAL_TIME;
		time += beat * BEAT_TIME_COEFF;
		if (beat > decay) beat -= decay;
		else beat = 0;
	}, INTERVAL_TIME);
}

function draw (strips) {
	for (var strip = 0; strip < strips.getStripNumber(); strip++) {
		var rgb = {};
		if (color == "rainbow") {
			rgb.red = (Math.sin(time * RAINBOW_TIME_COEFF + 0 + strip * 7) + 1) * 127;
			rgb.green = (Math.sin(time * RAINBOW_TIME_COEFF + 2 + strip * 7) + 1) * 127;
			rgb.blue = (Math.sin(time * RAINBOW_TIME_COEFF + 4 + strip * 7) + 1) * 127;
		} else {
			rgb = parseColor(color);
		}


		for (var n = 0; n < strips.getStripLength(strip); ++n) {
			var noise = (simplex.noise2D(n / density_divisor, time / TIME_DIVISOR
				+ strip * STRIP_DIFF_COEFF) + 1) / 2;
			noise *= noise;

			var pixelrgb = {};
			pixelrgb.red = rgb.red * noise;
			pixelrgb.green = rgb.green * noise;
			pixelrgb.blue = rgb.blue * noise;

			strips.setPixelSingle(strip, n, pixelrgb);
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
	darknoise : {
		name : "Darknoise (unicolor)",
		settings : {
			decay : [ "normal", "ultrafast", "fast", "slow" ],
			color : "rainbow",
			density : [ "normal", "low", "high", "higher" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "One-color noise animation. Moves faster on beat."
	}
};
