var socket = io();
var animations = {};
var queue = [];

function render_settings(name, presets) {
	var anim = animations[name];
	$("#settings").html("");
	for (var setting in anim.settings) {
		var settingItem = $("<i>invalid setting</i>");
		var settingType = anim.settings[setting];
		if (typeof settingType == "string") {
			settingItem = $('<input type="text" class="setting" value="'
				+ settingType + '">').data("setting", setting);
		} else if (Array.isArray(settingType)) {
			settingItem = $('<select class="setting">').data("setting", setting);
			for (var i in settingType) {
				$("<option>")
					.html(settingType[i])
					.attr("value", settingType[i])
					.appendTo(settingItem);
			}
		}

		if (presets && presets[setting]) {
			settingItem.val(presets[setting]);
		}

		$("#settings").append($("<tr>")
			.append($("<td>")
				.text(setting))
			.append($("<td>")
				.append(settingItem)));
	}
}

// Synced: Specifies wheter the change is already synchronized amongst other clients
// (true in that case, i.e. received from the server) or still has to be synced
// (false / unspecified then, i.e. local edit)
function update_queue (synced) {
	if (!synced) {
		// Send sync event to all clients
		socket.emit("sync_queue", queue);
	}

	// Render queue HTML
	$("#queuelist").html("");
	for (var i in queue) {
		var elem = queue[i];
		$("#queuelist").append($('<tr data-queueid="' + i + '">')
			.append($("<td>")
				.text(animations[elem.animation].name))
			.append($("<td>")
				.append('<input type="button" value="&#x232b;" class="delqueue">'))
			.append($("<td>")
				.append('<input type="button" value="&uarr;" class="moveup">'))
			.append($("<td>")
				.append('<input type="button" value="&darr;" class="movedown">'))
			.append($("<td>")
				.append('<input type="button" value="&larr;" class="loadqueue">')));
	}

	// Register queue modifier events
	$(".delqueue").click(function () {
		var qid = parseInt($(this).parent().parent().data("queueid"));
		queue.splice(qid, 1);
		update_queue();
	});

	$(".moveup").click(function () {
		var qid = parseInt($(this).parent().parent().data("queueid"));
		if (qid == 0) return;
		var tmp = queue[qid];
		queue[qid] = queue[qid - 1];
		queue[qid - 1] = tmp;
		update_queue();
	});

	$(".movedown").click(function () {
		var qid = parseInt($(this).parent().parent().data("queueid"));
		if (qid == queue.length - 1) return;
		var tmp = queue[qid];
		queue[qid] = queue[qid + 1];
		queue[qid + 1] = tmp;
		update_queue();
	});

	$(".loadqueue").click(function () {
		var qid = parseInt($(this).parent().parent().data("queueid"));
		$("#nextanim").val(queue[qid].animation);
		render_settings(queue[qid].animation, queue[qid].settings);
	});
}

$(function() {
	// Another client updated the queue
	socket.on("sync_queue", function (sync_queue) {
		queue = sync_queue;
		update_queue(true);
	});

	socket.emit("get_animations", null, function (res) {
		animations = res;
		for (var name in res) {
			var anim = res[name];
			$("<option/>").val(name).text(anim.name).appendTo("#nextanim");
		}

		var anim = $("#nextanim").val();
		render_settings(anim);
	});

	// Selected another animation --> update settings
	$("#nextanim").change(function () {
		var name = $(this).val();
		render_settings(name);
	});

	$("#addanimation").click(function () {
		// Get selected animation
		var animation = $("#nextanim").val();

		// Collect settings
		var settings = {};
		$(".setting").each(function (i, elem) {
			settings[$(elem).data("setting")] = $(elem).val();
		})

		// Send execute request for next animation
		.promise().done(function () {
			queue.push({ animation : animation, settings : settings });
			update_queue();
		});
	});
});
