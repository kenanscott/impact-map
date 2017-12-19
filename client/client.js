var map = null;
var legend = document.getElementById('legend');
var mapStyle = require('./map-style.json');
var pointsStyle = require('./points-style.json');

function initMap() {
	// Create a map object and specify the DOM element for display.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 38.922239,
			lng: -95.794675
		},
		disableDefaultUI: true,
		styles: mapStyle,
		zoom: 5
	});
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);

}

var pageviews = 0;
var commitments = 0;

var from = null;
var to = null;

var lastEvaluatedKey;

// Displays the points data provided.
function displayPoints(data) {
	return new Promise(function(resolve) {

		if (data.hasOwnProperty('LastEvaluatedKey')) lastEvaluatedKey = data.LastEvaluatedKey.Id;
		else lastEvaluatedKey = 'finished';

		for (var i = 0; i < data.Items.length; i++) {
			var LatLng = new google.maps.LatLng({
				lat: data.Items[i].Coordinates[0],
				lng: data.Items[i].Coordinates[1]
			});

			var circle = new google.maps.Circle({
				fillColor: pointsStyle[data.Items[i].Action].fillColor,
				fillOpacity: pointsStyle[data.Items[i].Action].fillOpacity,
				map: map,
				center: LatLng,
				radius: pointsStyle[data.Items[i].Action].radius,
				strokeWeight: 0
			});

			if (data.Items[i].Action === 'view') pageviews++;

			if (data.Items[i].Action === 'commitment') commitments++;

		}

		document.getElementById('pageviews').innerText = pageviews;
		document.getElementById('commitments').innerText = commitments;

		resolve('All points processed');

	});
}

function get(url) {
	return new Promise(function(resolve, reject) {

		// Do the usual XHR stuff
		var req = new XMLHttpRequest();
		req.open('GET', url);
		req.setRequestHeader('Content-Type', 'application/json');
		req.onload = function() {
			// This is called even on 404 etc
			// so check the status
			if (req.status == 200) {
				// Resolve the promise with the response text
				resolve(req.response);
			} else {
				// Otherwise reject with the status text
				// which will hopefully be a meaningful error
				statusBad('Disconnected, server error');
				reject(Error(req.statusText));
			}
		};

		// Handle network errors
		req.onerror = function() {
			statusBad('Disconnected, network error');
			reject(Error('Network Error'));
		};

		// Make the request
		req.send();

	});
}

// Delay for a number of milliseconds
function delay(t) {
	return new Promise(function(resolve) {
		setTimeout(resolve, t);
	});
}

// https://medium.com/adobe-io/how-to-combine-rest-api-calls-with-javascript-promises-in-node-js-or-openwhisk-d96cbc10f299
// https://gist.github.com/trieloff/168312d4dd4d149afdd55cde3d3724cabea
var promiseChain = {
	runChain: function() {
		var timeString = '';
		if (from === null) { // If from time is not specified, default to the beginning of today.
			var d = new Date();
			d.setHours(0, 0, 0, 0);
			from = d.getTime() / 1000;
		}

		if (to === null) { // If to time is not specified, default to now
			to = new Date() / 1000;
		}

		timeString = 'from=' + from + '&to=' + to + '&';

		var exclusiveStartKeyString = '';
		if (lastEvaluatedKey != undefined && lastEvaluatedKey != 'finished') {
			exclusiveStartKeyString = 'exclusivestartkey=' + lastEvaluatedKey;
		}

		get('/rest/live/read?' + timeString + exclusiveStartKeyString).then(JSON.parse).then(displayPoints).then(function() {
			if (lastEvaluatedKey !== 'finished') promiseChain.runChain();
			else {
				// Done paginating through data
				from = to + 0.001;
				to = null;
				statusGood('Map connected live');
				return delay(3000).then(function() {
					promiseChain.runChain();
				});
			}
		}).catch(function() {
			return delay(3000).then(function() {
				promiseChain.runChain();
			});
		});
	}
};

var midnight = new Date();
midnight.setDate(new Date().getDate()+1);
midnight.setHours(0,0,0,0);
midnight = midnight / 1000;
var now = new Date() / 1000;
midnight = midnight - now;
midnight = midnight + 5; // Add 5 seconds as a cushion
setTimeout(
	midnightTask,
	midnight * 1000
);


function midnightTask() {
	window.location.reload(true);
}

promiseChain.runChain(); // execute function
