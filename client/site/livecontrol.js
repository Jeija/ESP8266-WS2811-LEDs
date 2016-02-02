var socket = io();
var animations = {};

var RECORDING_PLAYBACK_INTERVAL = 0.01;

var recording = false;
var recording_events = [];
var recording_begin;
var recording_playback_begin;
var recording_playback_lasttime;
var recording_playback_interval;

// Send animation events, such as rhythm
function send_key_event(key) {
	if (key == "n") socket.emit("next_animation");
	if (key == "a" || key == "s" || key == "d" || key == "f")
			socket.emit("event", { type : "beat" });

	socket.emit("event", { type : "keypress", data : key });
}

// Get place of time on timeline as css style
function recording_timeline_getperc(time) {
	var maxtime = recording_events[recording_events.length - 1].time;

	var offset;
	if (maxtime != 0)
		offset = 90 * time / maxtime;
	else
		offset = 0;

	return offset + "%";
}

// Show events on display area
function recording_update_display() {
	$("#record_events").html("");
	recording_events.forEach(function (ev) {
		$("#record_events").append(
			$("<div>")
				.text(ev.key)
				.addClass("record_event")
				.css("left", recording_timeline_getperc(ev.time))
		);
	});
}

// Record keypresses to replay them
function recording_toggle() {
	recording = !recording;

	if (recording) {
		$("#record_indicator").addClass("recording");
		recording_events = [];
	} else {
		$("#record_indicator").removeClass("recording");
	}
}

// Store keypresses when recording is on
function recording_hook(key) {
	if (!recording) return;
	if (key == "r") return;

	if (recording_events.length == 0)
		recording_begin = Date.now() / 1000;

	recording_events.push({
		time : Date.now() / 1000 - recording_begin,
		key : key
	});

	// Sort by timestamp, just to make sure
	recording_events.sort(function (a, b) {
		if (a.time > b.time) return 1;
		if (a.time < b.time) return -1;
		return 0;
	});

	recording_update_display();
}

function recording_playback_cb() {
	var time = Date.now() / 1000 - recording_playback_begin;

	// Draw red iterator that indicates time
	$("#record_iter").css("left", recording_timeline_getperc(time))

	// See what keys need to be played in the next RECORDING_PLAYBACK_INTERVAL seconds
	recording_events.forEach(function (ev) {
		if (recording_playback_lasttime <= ev.time &&
				time > ev.time)
			send_key_event(ev.key);
	});

	recording_playback_lasttime = time;

	// Playback finished: stop
	var maxtime = recording_events[recording_events.length - 1].time;
	if (time > maxtime) clearInterval(recording_playback_interval);
}

function recording_playback() {
	recording_playback_time = 0;
	recording_playback_lasttime = 0;
	clearInterval(recording_playback_interval);
	recording_playback_begin = Date.now() / 1000;
	recording_playback_interval = setInterval(recording_playback_cb, RECORDING_PLAYBACK_INTERVAL * 1000);
}

/*** Live preview canvas size adjustment ***/
function on_previews_resize() {
	$(".strip-preview").each(function () {
		var cv = $(this).children("canvas");
		var ctx = cv[0].getContext("2d");
		pv_w = cv.width();
		pv_h = cv.height();
		if (ctx.canvas.width != pv_w) ctx.canvas.width = pv_w;
		if (ctx.canvas.height != pv_h) ctx.canvas.height = pv_h;
	});
}

/*** Add previews to list ***/
function setup_previews(n) {
	$("#previews").html();

	for (var i = 0; i < n; ++i) {
		var cv = $("<canvas>")
			.addClass("strip-preview-canvas");
		cv.fillStyle = "#000";

		$("<div>")
			.addClass("strip-preview")
			.append($("<div>")
				.addClass("strip-preview-heading")
				.text("Strip " + i))
			.append(cv)
			.appendTo($("#previews"));
	}

	on_previews_resize();
}

$(function() {
	// Update next animation whenever it changes
	socket.on("sync_queue", function (queue) {
		if (!queue[0]) $("#next").html("<i>Queue is empty!</i>");
		else $("#next").text(animations[queue[0].animation].name);
	});

	socket.emit("get_animations", null, function (res) {
		animations = res;
	});

	// Make sure previews are always correctly resized
	$(window).resize(on_previews_resize);
	setInterval(on_previews_resize, 100);

	// Refresh live preview
	setInterval(function () {
		socket.emit("get_preview", null, function (fb) {
			// Setup preview canvases or adapt to changes
			if ($(".strip-preview").length != fb.length) 
				setup_previews(fb.length);

			fb.forEach(function (stripfb, idx) {
				var cv = $(".strip-preview").eq(idx).children("canvas");
				var ctx = cv[0].getContext("2d");
				var width = ctx.canvas.width;
				var height = ctx.canvas.height;
				var pixelw = Math.floor(width / stripfb.length);

				for (var px in stripfb) {
					// Set pixel color
					var col = stripfb[px];
					var r = (col && col.red) ? Math.floor(col.red) : 0;
					var g = (col && col.green) ? Math.floor(col.green) : 0;
					var b = (col && col.blue) ? Math.floor(col.blue) : 0;
					ctx.fillStyle = "rgb("+ r +","+ g +","+ b +")";

					// Set pixel position
					var xoffs = Math.ceil(px * pixelw);
					ctx.fillRect(xoffs, height / 2 - pixelw / 2, pixelw - 1, pixelw);
				}
			});
		});
	}, 20);

	setInterval(function () {
		// Update current animation + description
		socket.emit("get_current_animation", null, function (name) {
			$("#active").text("");
			$("#description").text("");
			if (!animations[name]) return;
			$("#active").text(animations[name].name);
			$("#description").text(animations[name].description);
		});
	}, 100);

	// Keyboard controls
	$(document).keypress(function(e) {
		var key = e.key ? e.key : String.fromCharCode(e.charCode);

		// Translate arrow keys to strings
		if(e.keyCode == 37) key = "Left";
		if(e.keyCode == 38) key = "Up";
		if(e.keyCode == 39) key = "Right";
		if(e.keyCode == 40) key = "Down";

		if (key == "r") recording_toggle();
		recording_hook(key);
		if (key == "p") recording_playback();

		send_key_event(key);
	});
});
