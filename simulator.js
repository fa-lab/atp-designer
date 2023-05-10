'use strict'

var CURRENT_COLOR = 'r';

var CURRENT_BRIGHT = 28;
// const MAX_BRIGHT = 31;
// const BRIGHT_MAP = [0, 20, 25, 33, 38, 43, 48, 51, 55, 58, 61, 63, 66, 68, 71, 73, 76, 78, 81, 83, 85, 87, 88, 90, 93, 94, 95, 96, 97, 98, 99, 100]; Normal

const MAX_BRIGHT = 28;
const BRIGHT_MAP = [0, 20, 25, 33, 38, 43, 48, 51, 55, 58, 61, 63, 66, 68, 71, 73, 76, 78, 81, 83, 85, 87, 88, 90, 93, 94, 95, 96, 100]; // Economy

var RENDER_SIZE_SEC = 10;
var IS_MOUSE_DOWN = false;

const LED_ATPNODE_LED = 50;

var MOVE_ORIGIN;


var EDITOR_MODE = 0;
var EDITOR_TIME_PAGE = 0;

const EDITOR_WRITE_MODE = 0;
const EDITOR_ERASE_MODE = 1;
const EDITOR_SELECT_MODE = 2;


const TIME_DIV = 8;
const TIME_TICKS = 1000 / TIME_DIV;
const CELL_SIZE = 30;

var TIMELINE_OFFSET = 0;
var TIMELINE_SIZE = 5;

var LED_OFFSET = 0;
var LED_VIEW_SIZE = 50;

var LED_CHANNELS = 16;
var LED_MAX_SIZE = 50;

if (localStorage['atp_led_view_size'])
	LED_VIEW_SIZE = parseInt(localStorage['atp_led_view_size']);

if (localStorage['atp_timeline_size'])
	TIMELINE_SIZE = parseInt(localStorage['atp_timeline_size']);

if (localStorage['atp_led_max_size'])
	LED_MAX_SIZE = parseInt(localStorage['atp_led_max_size']);

if (localStorage['atp_led_channels'])
	LED_CHANNELS = parseInt(localStorage['atp_led_channels']);


if (LED_VIEW_SIZE > LED_CHANNELS * LED_MAX_SIZE) {
	LED_VIEW_SIZE = LED_CHANNELS * LED_MAX_SIZE;
}

var dom_arrays = [];

function onFileChoose(input) {
	if (input.files && input.files[0]) {
		var oFReader = new FileReader();
		oFReader.readAsText(input.files[0]);
		oFReader.onload = function(oFREvent) {

			load_project(oFReader.result);
		};
	}
}

var data_buffer = [];
for (var i = 0; i < LED_ATPNODE_LED; i++) {
	data_buffer.push(0);
}

var bin_data = [];
function getAsData(dt, data) {
	if (data) {
		for (var led_ch in data) {
			for (var i = 0; i < LED_ATPNODE_LED; i++) {
				data_buffer[i] = 0;
			}
			for (var led_index in data[led_ch]) {
				let color = data[led_ch][led_index][0];
				let bright = parseInt(data[led_ch][led_index][1]);
				data_buffer[led_index] = color + ',' + bright;
			}

			bin_data.push([parseInt(led_ch), dt, data_buffer.slice()]);
			// console.log('\t' + str);
			dt = 0;
		}
	} else {
		bin_data.push([-1, dt]);
	}
}

function choose_file() {
	document.getElementById('theFile').click();
}

var tmr_test;
var tmr_sec = 0;

function reload_project() {
	let designer_data = {};
	for (var i = 0; i < localStorage.length; i++) {
		if (localStorage.key(i).startsWith('atp_data_')) {
			let key = localStorage.key(i);
			let data = localStorage[key];
			data = data.trim();
			if (data.charAt(data.length - 1) == ';') {
				data = data.slice(0, -1);
			}
			data = data.split(';');
			for (let i = 0; i < data.length; i++) {
				let r_data = data[i].split(',', 4);
				let seconds = parseInt(key.slice(9));
				let time_idx = parseInt(r_data[0]);
				let led_idx = parseInt(r_data[1]);
				let value = r_data[2] + ',' + r_data[3];
				if (led_idx >= LED_MAX_SIZE * LED_CHANNELS) {
					return;
				}
				if (!designer_data[seconds]) {
					designer_data[seconds] = {};
				}
				if (!designer_data[seconds][time_idx]) {
					designer_data[seconds][time_idx] = {};
				}
				if (!designer_data[seconds][time_idx][led_idx]) {
					designer_data[seconds][time_idx][led_idx] = {};
				}
				designer_data[seconds][time_idx][led_idx] = value;
			}

		}
	}


	let last_t = 0;
	let dt = 0;
	let target_t;

	var t_datas = {};
	for (const seconds in designer_data) {
		for (const time_index in designer_data[seconds]) {
			for (const led_index in designer_data[seconds][time_index]) {

				let sec = parseInt(seconds);
				let ti = parseInt(time_index);
				let li = parseInt(led_index);


				if (!t_datas[sec * 8 + ti]) {
					t_datas[sec * 8 + ti] = {};
				}

				if (!t_datas[sec * 8 + ti][Math.floor(li / LED_MAX_SIZE)]) {
					t_datas[sec * 8 + ti][Math.floor(li / LED_MAX_SIZE)] = {};
				}

				if (!t_datas[sec * 8 + ti][Math.floor(li / LED_MAX_SIZE)][li % LED_MAX_SIZE]) {
					t_datas[sec * 8 + ti][Math.floor(li / LED_MAX_SIZE)][li % LED_MAX_SIZE] = [];
				}

				let val = designer_data[sec][ti][li];
				val = val.split(',', 2);

				t_datas[sec * 8 + ti][Math.floor(li / LED_MAX_SIZE)][li % LED_MAX_SIZE][0] = val[0];
				t_datas[sec * 8 + ti][Math.floor(li / LED_MAX_SIZE)][li % LED_MAX_SIZE][1] = parseInt(val[1]);
			}
		}
	}
	let kys = Object.keys(t_datas);
	console.log(kys[kys.length - 1]);

	// time_index
	// led_ch
	// led_idx
	// []

	bin_data = [];
	var start_t = 0;

	var last_t_idx = -1;
	for (var t_idx = 0; t_idx < parseInt(kys[kys.length - 1]) + 1; t_idx++) {
		if (t_datas[t_idx]) {
			if ((t_idx - last_t_idx) > 1) {
				target_t = start_t + TIME_TICKS * (last_t_idx + 1);

				dt = target_t - last_t;
				//console.log('APPEND', target_t, dt, 'CLEAR');
				getAsData(dt);
				last_t = target_t;
			}
			target_t = start_t + TIME_TICKS * t_idx;
			dt = target_t - last_t;
			//console.log('APPEND', target_t, dt, t_datas[t_idx]);
			getAsData(dt, t_datas[t_idx]);
			last_t_idx = t_idx;
			last_t = target_t;
		}

	}

	target_t = target_t + TIME_TICKS;
	getAsData(TIME_TICKS);
	start_t = 0;


	tmr_sec = 0;
	document.getElementById('txt-status').innerHTML = tmr_sec;
	tmr_test = setInterval(function() {
		tmr_sec = tmr_sec + 125;
		document.getElementById('txt-status').innerHTML = (tmr_sec / 1000).toFixed(2);
	}, 125);

	for (var i = 0; i < bin_data.length; i++) {

		let idx = bin_data[i][0];
		let dt = bin_data[i][1];
		let d = bin_data[i][2];
		start_t += dt;
		setTimeout(createfunc(idx, d), start_t);
	}
	setTimeout(function() {
		clearInterval(tmr_test);
	}, start_t + 125);

}
function createfunc(idx, d) {
	if (idx != -1 && d) {
		return function() {
			// dom_arrays : [ led_length x led_ch]
			for (var i = 0; i < dom_arrays.length; i++) {
				if (d[i] == 0) {
					dom_arrays[i][idx].removeAttribute('led_color');
					dom_arrays[i][idx].removeAttribute('led_bright');
				} else {
					let c = d[i].split(',', 2)[0];
					let b = d[i].split(',', 2)[1];
					dom_arrays[i][idx].setAttribute('led_color', c);
					dom_arrays[i][idx].setAttribute('led_bright', b);
				}
			}
		};
	} else {
		return function() {
			$('.ATPSimBox').removeAttr('led_color');
			$('.ATPSimBox').removeAttr('led_bright');
		};
	}

}


$(document).ready(function() {
	var dom_row;
	dom_arrays = [];
	for (var row_led_idx = 0; row_led_idx < LED_MAX_SIZE; row_led_idx++) {
		dom_row = $('<div></div>', { class: "ATPRow" });
		var dom_tl_arrays = [];
		for (var row_ch = 0; row_ch < LED_CHANNELS; row_ch++) {

			var box = $('<div></div>', { class: "ATPBox ATPSimBox" });

			dom_tl_arrays.push(box[0]);
			box.attr('led_ch', row_ch);
			box.attr('led_index', row_led_idx);


			box.html('&nbsp;');
			dom_row.append(box);

		}
		dom_arrays.push(dom_tl_arrays);
		$("#designer").append(dom_row);
	}

});
