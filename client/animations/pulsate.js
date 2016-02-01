INTERVAL_TIME = 0.01;

var parseColor = require("./parsecolor");
var interval, freq, time, sync, color1, color2;

function init (strips, settings) {
	sync = settings.sync;
	color1 = settings.color1;
	color2 = settings.color2;
	time = Math.random() * 100;

	switch (settings.frequency) {
		case "ultrahigh":	freq = 10.0; break;
		case "superhigh":	freq =  6.0; break;
		case "high":		freq =  2.5; break;
		case "normal":		freq =  1.0; break;
		case "low":			freq =  0.5; break;
		case "superlow":	freq =  0.2; break;
	}

	interval = setInterval(function () {
		time += INTERVAL_TIME;
	}, INTERVAL_TIME * 1000);
}

function getColor(color, strip, t, offset) {
	var phase = Math.floor((t + offset / freq) / (Math.PI / freq)) * 8;

	if (color != "rainbow")
		return parseColor(color);
	else if (color == "rainbow") {
		return {
			red : (Math.sin(phase + 0) + 1) * 127,
			green : (Math.sin(phase + 2) + 1) * 127,
			blue : (Math.sin(phase + 4) + 1) * 127
		};
	}
}

function draw (strips) {
	for (var strip = 0; strip < strips.getStripNumber(); ++strip) {
		var offset = 0;

		// Generate sync
		if (sync == "random") {
			offset = Math.sin(strip * 7) * 10;
		} else if (sync == "alternate") {
			offset = strip * Math.PI / 2;
		} else if (sync == "order") {
			offset = strip * Math.PI / 6;
		} else offset = 1;

		var amp = Math.sin(time * freq + offset);
		var intensity = Math.abs(amp);

		// Generate color
		var rgb;
		for (var i = 0; i < strips.getStripNumber(); ++i) {
			if (amp >= 0) rgb = getColor(color1, strip, time, offset);
			else rgb = getColor(color2, strip, time, offset);
		}

		strips.fillSingle(strip, {
			red : intensity * rgb.red,
			green : intensity * rgb.green,
			blue : intensity * rgb.blue
		});	
	}
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	pulsate : {
		name : "Pulsate",
		settings : {
			frequency : [ "high", "superhigh", "ultrahigh", "normal", "low", "superlow" ],
			sync : [ "synchronous", "random", "alternate", "order" ],
			color1 : "rainbow",
			color2 : "rainbow"
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Pulsates strips with random colors."
	}
};
