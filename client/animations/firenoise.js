var SimplexNoise = require("simplex-noise");
var simplex = new SimplexNoise();

var color, beat, time, interval, decay, brightness, offset, density, sync;

var INTERVAL_TIME = 0.01;
var BEAT_COEFF = 0.05;
var TIME_COEFF = 0.8;
var RANDOM_SYNC_OFFSET = 5;

function init (strips, settings) {
	color = settings.color;

	switch (settings.brightness) {
		case "superdark":	brightness = 0.4; break;
		case "dark":		brightness = 0.7; break;
		case "bright":		brightness = 1  ; break;
	}

	switch (settings.decay) {
		case "fast":	decay = 7; break;
		case "normal":	decay = 5; break;
		case "slow":	decay = 2; break;
	}

	switch (settings.density) {
		case "low":		density = 20; break;
		case "normal":	density = 12; break;
		case "high":	density =  6; break;
	}

	switch (settings.sync) {
		case "synchronous": sync = 0; break;
		case "random": sync = RANDOM_SYNC_OFFSET; break;
	}

	time = 0;
	offset = 0;
	beat = 0;

	interval = setInterval(function () {
		if (beat > decay * INTERVAL_TIME) beat -= decay * INTERVAL_TIME;
		else beat = 0;

		time += INTERVAL_TIME;
		offset += beat * BEAT_COEFF;
		if (beat > decay * INTERVAL_TIME) beat -= decay * INTERVAL_TIME;
	}, INTERVAL_TIME * 1000);
}

function draw (strips) {
	for (var strip = 0; strip < strips.getStripNumber(); ++strip) {
		for (var px = 0; px < strips.getStripLength(strip); ++px) {
			var noise = (simplex.noise2D(px / density,
				offset + time * TIME_COEFF + strip * sync) + 1) / 2;

			var rgb1, rgb2;
			if (color == "fire") {
				rgb1 = { red : 255, green : 20, blue : 0 };
				rgb2 = { red : 200, green : 200, blue : 0 };
			} else if (color == "bluefire") {
				rgb1 = { red : 0, green : 0, blue : 255 };
				rgb2 = { red : 200, green : 200, blue : 200 };
			} else if (color == "pinknoise") {
				rgb1 = { red : 255, green : 50, blue : 50 };
				rgb2 = { red : 230, green : 230, blue : 230 };
			}

			// Linear interpolation between rgb1 and rgb2 depending on noise
			var rgb = {
				red : rgb1.red * noise + rgb2.red * (1 - noise),
				green : rgb1.green * noise + rgb2.green * (1 - noise),
				blue : rgb1.blue * noise + rgb2.blue * (1 - noise),
			};

			rgb.red *= brightness;
			rgb.green *= brightness;
			rgb.blue *= brightness;

			strips.setPixelSingle(strip, px, rgb);
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
	firenoise : {
		name : "Firenoise",
		settings : {
			color : [ "bluefire", "fire", "pinknoise" ],
			brightness : [ "bright", "dark", "superdark" ],
			decay : [ "fast", "normal", "slow" ],
			density : [ "normal", "low", "high" ],
			sync : [ "synchronous", "random" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Fire-like simplex noise animation. No special keys."
	}
};
