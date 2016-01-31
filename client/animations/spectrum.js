var DECAY_PER_FRAME = 0.04;
var NEW_PER_FRAME = 0.3;
var OLD_PER_FRAME = 0.9;
var MAXFREQ = 1600;
var FREQ_INTERPOL_DEG = 2;
var VOLUME_COEFF = 0.1;

var spawn = require("child_process").spawn;
var parseColor = require("./parsecolor");
var fjs = require("frequencyjs");

var color, interval, arecord, audioIn, spectrum = [], vol = 0, time = 0;

function init (strips, settings) {
	arecord = spawn("arecord", ["--rate", "16000", "-f", "U8", "-F", "16000", "-"]);
	audioIn = new require("stream").PassThrough();
	arecord.stdout.pipe(audioIn);
	color = settings.color;

	audioIn.on("data", function(data) {
		var freqArray = [];
		var vol = 0;
		for (i = 0; i < data.length; i++) {
			vol += Math.abs(data[i]-128);
			freqArray.push(data[i]-128);
		}
		vol = vol / data.length;
		if (freqArray.length != 256) return;

		spectrum = fjs.Transform.toSpectrum(freqArray, {sampling : 16000, method : "fft"});
	});

	interval = setInterval(function () {
		time += 0.1;
	}, 100);
}

var lastbars = [];
function drawbar(strips, s, amplitude, color) {
	var height = amplitude * strips.getStripLength(s) * VOLUME_COEFF;

	if (!lastbars[s]) lastbars[s] = 0;
	if (lastbars[s] < 0) lastbars[s] = 0;
	if (lastbars[s] > strips.getStripLength(s)) lastbars[s] = strips.getStripLength(s);
	lastbars[s] = lastbars[s] * OLD_PER_FRAME + height * NEW_PER_FRAME;
	lastbars[s] -= DECAY_PER_FRAME * strips.getStripLength(s);
	var hperc = lastbars[s] / strips.getStripLength(s);
	if (hperc > 1) hperc = 1;

	// Determine bar color
	var rgb;
	if (color == "intensity1")
		rgb = { red : hperc * 255, green : 255 - hperc * 255 };
	else if (color == "intensity1_blue")
		rgb = { red : hperc * 255, blue : 255 - hperc * 255 };
	else if (color == "intensity1_cyan")
		rgb = { red : hperc * 255, blue : 255 - hperc * 255, green : 255 - hperc * 255 };
	else if (color == "rainbowdash")
	{
		if (Math.round(s + time * 5) % 6 == 0) rgb = { red : 238, green :  20, blue :  20 };
		if (Math.round(s + time * 5) % 6 == 1) rgb = { red : 250, green : 150, blue :  20 };
		if (Math.round(s + time * 5) % 6 == 2) rgb = { red : 253, green : 246, blue : 100 };
		if (Math.round(s + time * 5) % 6 == 3) rgb = { red :  50, green : 210, blue :  50 };
		if (Math.round(s + time * 5) % 6 == 4) rgb = { red :  30, green : 152, blue : 211 };
		if (Math.round(s + time * 5) % 6 == 5) rgb = { red : 110, green :  20, blue : 130 };
	}
	else if (color != "intensity2" && color != "intensity2_blue" && color != "intensity3")
		rgb = parseColor(color);

	for (var px = 0; px < lastbars[s] - 1; px++) {
		var perc = px / strips.getStripLength(s);
		if (color == "intensity2")
			rgb = { red : perc * 255, green : 255 - perc * 255 };
		else if (color == "intensity2_blue")
			rgb = { red : perc * 255, blue : 255 - perc * 255 };
		else if (color == "intensity3")
			rgb = { red : perc > 0.3 ? 255 : 0, green : perc < 0.7 ? 255 : 0 };
		strips.setPixelSingle(s, px, rgb);
	}
}

function freqSum(spectrum, lowerLimit, upperLimit) {
	var nFreq = 0;
	var amplitude = 0;
	for (var i in spectrum) {
		if (spectrum[i].frequency > lowerLimit && spectrum[i].frequency < upperLimit) {
			nFreq++;
			amplitude += spectrum[i].amplitude;
		}
	}

	return amplitude;
}

/*
 * Calculate the frequency range of the nth bar out of total
 * using simple interpolation
 */
function getBarFrequency(n, total) {
	var coeff = MAXFREQ / Math.pow(total + 2, FREQ_INTERPOL_DEG);
	return {
		lower : coeff * Math.pow(n + 2, FREQ_INTERPOL_DEG),
		upper : coeff * Math.pow(n + 3, FREQ_INTERPOL_DEG)
	};
}

function draw (strips) {
	strips.clearAll();

	// Draw background color (if any)
	if (color == "rainbowdash") {
		strips.fillAll({ red : 80, green :  80, blue : 180 });
	}

	for (var s = 0; s < strips.getStripNumber(); ++s) {
		var freq = getBarFrequency(s, strips.getStripNumber());
		drawbar(strips, s, freqSum(spectrum, freq.lower, freq.upper), color);
	}
}

function event (ev, data) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
	arecord.kill();
}

module.exports = {
	spectrum : {
		name : "Spectrum",
		init : init,
		draw : draw,
		event : event,
		settings : {
			color : ["white", "red", "green", "blue", "intensity1", "intensity1_blue",
				"intensity1_cyan", "intensity2", "intensity2_blue", "intensity3",
				"rainbowdash"]
		},
		terminate : terminate,
		description : "Audio spectrum"
	}
};
