var parseColor = require("./parsecolor");
var color, beat, interval, decay, particles;

var INTERVAL_TIME = 0.01;

function Particle(strip, color, position, velocity, lifetime) {
	this.strip = strip;
	this.age = 0;
	this.pos = position;
	this.vel = velocity;
	this.lifetime = lifetime;
}

Particle.prototype.step = function(dtime) {
	this.age += dtime;
	this.pos += this.vel * dtime;

	if (this.age > this.lifetime) return true;
}

Particle.prototype.draw = function(strips) {
	// TODO: generate rgb
	var rgb = {
		red : 255,
		green : 0,
		blue : 0
	};

	strips.setPixelSingle(this.strip, Math.floor(this.pos), rgb);
}

function init (strips, settings) {
	switch (settings.decay) {
		case "ultrafast":	decay = 0.1; break;
		case "fast":		decay = 0.05; break;
		case "normal":		decay = 0.03; break;
		case "slow":		decay = 0.015; break;
	}

	particles = [];
	beat = 0;

	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;

		if (beat > 0) {
			particles.push(
				new Particle(0, "todo", 25, 2, 10)
			);
		}

		particles.forEach(function (p) {
			p.step(INTERVAL_TIME);
		});
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
			decay : [ "ultrafast", "fast", "normal", "slow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Glows bright on beat and decays. No special keys."
	}
};
