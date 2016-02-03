var parseColor = require("./parsecolor");
var color, time, beat, interval, decay, particles, max_amount, spawnpoint, maxvelocity, friction, maxlifetime;

var INTERVAL_TIME = 0.01;
var MINVEL = 0.1;
var MINLIFETIME = 0.3;

/**
 * Make new particle object on strip, with string color,
 * given position (nth pixel of string), given velocity (px / s),
 * lifetime (seconds) and friction (force coefficient for deceleration)
 */
function Particle(strip, position, velocity, lifetime) {
	this.strip = strip;
	this.age = 0;
	this.pos = position;
	this.vel = velocity;
	this.lifetime = lifetime;
	this.randomseed = Math.random();
}

Particle.prototype.step = function(dtime, strips) {
	this.age += dtime;
	this.pos += this.vel * dtime;
	this.vel -= this.vel * friction * dtime;

	if (this.pos < 0 || this.pos > strips.getStripLength(this.strip)) {
		return true;
	}

	if (this.age > this.lifetime) return true;
}

function interpolate(rgb1, rgb2, noise) {
	return {
		red : rgb1.red * noise + rgb2.red * (1 - noise),
		green : rgb1.green * noise + rgb2.green * (1 - noise),
		blue : rgb1.blue * noise + rgb2.blue * (1 - noise),
	};
}

Particle.prototype.draw = function(strips) {
	var rgb = {};

	if (color == "fire") {
		rgb1 = { red : 255, green : 20, blue : 0 };
		rgb2 = { red : 200, green : 200, blue : 0 };
		rgb = interpolate(rgb1, rgb2, this.randomseed);
	} else if (color == "bluefire") {
		rgb1 = { red : 0, green : 0, blue : 255 };
		rgb2 = { red : 200, green : 200, blue : 200 };
		rgb = interpolate(rgb1, rgb2, this.randomseed);
	} else if (color == "rainbow") {
		rgb.red = (Math.sin(this.randomseed * 2 * Math.PI + 0) + 1) * 127;
		rgb.green = (Math.sin(this.randomseed * 2 * Math.PI + 2) + 1) * 127;
		rgb.blue = (Math.sin(this.randomseed * 2 * Math.PI + 4) + 1) * 127;
	} else if (color == "rainbowpos") {
		rgb.red = (Math.sin(this.pos / 5 + 0) + 1) * 127;
		rgb.green = (Math.sin(this.pos / 5 + 2) + 1) * 127;
		rgb.blue = (Math.sin(this.pos / 5 + 4) + 1) * 127;
	} else if (color == "rainbowtime") {
		rgb.red = (Math.sin(time + this.age * 5 + 0) + 1) * 127;
		rgb.green = (Math.sin(time + this.age * 5 + 2) + 1) * 127;
		rgb.blue = (Math.sin(time + this.age * 5 + 4) + 1) * 127;
	} else {
		rgb = parseColor(color);
	}

	strips.setPixelSingle(this.strip, Math.floor(this.pos), rgb);
}

function init (strips, settings) {
	color = settings.color;
	spawnpoint = settings.spawnpoint;

	switch (settings.decay) {
		case "ultrafast":	decay = 0.1; break;
		case "fast":		decay = 0.05; break;
		case "normal":		decay = 0.03; break;
		case "slow":		decay = 0.015; break;
	}

	switch (settings.amount) {
		case "superhigh":	max_amount = 300; break;
		case "high":		max_amount = 250; break;
		case "normal":		max_amount = 150; break;
		case "low":			max_amount = 50; break;
	}

	switch (settings.friction) {
		case "superhigh":	friction = 3; break;
		case "high":		friction = 1; break;
		case "normal":		friction = 0.5; break;
		case "low":			friction = 0.2; break;
		case "none":		friction = 0; break;
	}

	switch (settings.lifetime) {
		case "superhigh":	maxlifetime = 4; break;
		case "high":		maxlifetime = 2; break;
		case "normal":		maxlifetime = 1; break;
		case "low":			maxlifetime = 0.5; break;
	}

	switch (settings.velocity) {
		case "superfast":	maxvelocity = 100; break;
		case "fast":		maxvelocity = 80; break;
		case "normal":		maxvelocity = 50; break;
		case "slow":		maxvelocity = 20; break;
	}

	particles = [];
	beat = 0;
	time = 0;

	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;

		time += INTERVAL_TIME;

		// Move all particles
		for (var j = particles.length - 1; j >= 0; j--) {
			if (particles[j].step(INTERVAL_TIME, strips)) particles.splice(j, 1);
		}

		// Spawn particles on beat
		for (var strip = 0; strip < strips.getStripNumber(); ++strip) {
			for (var i = 0; i < max_amount; ++i) {
				if (Math.random() < beat * INTERVAL_TIME) {
					var spawnpos;
					if (spawnpoint == "center") {
						spawnpos = strips.getStripLength(strip) / 2;
					} else if (spawnpoint == "two") {
						spawnpos = (Math.random() > 0.5 ? 3/4 : 1/4) * strips.getStripLength(strip);
					} else if (spawnpoint == "bothends") {
						spawnpos = (Math.random() > 0.5 ? 1 : 0) * strips.getStripLength(strip);
					} else if (spawnpoint == "start") {
						spawnpos = 0;
					} else if (spawnpoint == "end") {
						spawnpos = strips.getStripLength(strip);
					}

					var velocity = (Math.random() * (2 - 2 * MINVEL)) - (1 - MINVEL);
					velocity += Math.sign(velocity) * MINVEL;
					velocity *= maxvelocity;

					var lifetime = Math.random() * (maxlifetime - MINLIFETIME) + MINLIFETIME;

					// Spawn particle on strip
					particles.push(
						new Particle(
							strip, spawnpos, velocity, lifetime
						)
					);
				}
			}
		}
	}, INTERVAL_TIME * 1000);
}

function draw (strips) {
	strips.clearAll();
	particles.forEach(function (p) {
		p.draw(strips);
	});
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	particles : {
		name : "Particles",
		settings : {
			color : [ "fire", "bluefire", "rainbow", "rainbowpos", "rainbowtime", "white", "red", "green", "blue" ],
			decay : [ "normal", "fast", "ultrafast", "slow" ],
			spawnpoint : [ "center", "start", "two", "end", "bothends" ],
			amount : [ "normal", "high", "superhigh", "low" ],
			velocity : [ "normal", "slow", "fast", "superfast" ],
			friction : [ "normal", "low", "high", "superhigh", "none" ],
			lifetime : [ "normal", "high", "superhigh", "low" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Adds particles (single pixels) on beat. No special keys."
	}
};
