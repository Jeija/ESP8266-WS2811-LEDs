var SimplexNoise = require("simplex-noise");
var simplex = new SimplexNoise();

var color, beat, time, interval, decay, brightness, offset, density, sync;

var INTERVAL_TIME = 0.01;
var BEAT_COEFF = 0.05;
var TIME_COEFF = 0.2;
var RANDOM_SYNC_OFFSET = 5;

function init (strips, settings) {
	color = settings.color;

	switch (settings.decay) {
		case "fast":	decay = 7; break;
		case "normal":	decay = 5; break;
		case "slow":	decay = 2; break;
	}

	switch (settings.density) {
		case "low":		density = 60; break;
		case "normal":	density = 30; break;
		case "high":	density = 15; break;
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
	}, INTERVAL_TIME * 1000);
}

function draw (strips) {
	for (var strip = 0; strip < strips.getStripNumber(); ++strip) {
		for (var px = 0; px < strips.getStripLength(strip); ++px) {
			var noise = (simplex.noise2D(px / density,
				offset + time * TIME_COEFF + strip * sync) + 1) * Math.PI;

			var rgb = {
				red : (Math.sin(noise - 0) + 1) * 127,
				green : (Math.sin(noise - 2) + 1) * 127,
				blue : (Math.sin(noise - 4) + 1) * 127
			};

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
	heatnoise : {
		name : "Heat Noise",
		settings : {
			decay : [ "fast", "normal", "slow" ],
			density : [ "normal", "low", "high" ],
			sync : [ "synchronous", "random" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Colorful noise function. Moves faster on beat."
	}
};
