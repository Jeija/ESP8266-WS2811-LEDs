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
				offset + time * TIME_COEFF + strip * sync) + 1) / 2;

			var rgb;
			if (noise > 0/6 && noise < 1/6) rgb = { red : 238, green :  20, blue :  20 };
			if (noise > 1/6 && noise < 2/6) rgb = { red : 250, green : 150, blue :  20 };
			if (noise > 2/6 && noise < 3/6) rgb = { red : 253, green : 246, blue : 100 };
			if (noise > 3/6 && noise < 4/6) rgb = { red :  50, green : 210, blue :  50 };
			if (noise > 4/6 && noise < 5/6) rgb = { red :  30, green : 152, blue : 211 };
			if (noise > 5/6 && noise < 6/6) rgb = { red : 110, green :  20, blue : 130 };

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
	rainbownoise : {
		name : "Rainbow dash noise",
		settings : {
			decay : [ "fast", "normal", "slow" ],
			density : [ "normal", "low", "high" ],
			sync : [ "synchronous", "random" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Rainbow dash tail color animation. No special keys."
	}
};
