var map = null;
var legend = document.getElementById('legend');

function initMap() {
  // Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 38.922239,
      lng: -95.794675
    },
    disableDefaultUI: true,
    styles: styles,
    zoom: 5
  });
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
}

var styles = [{
    "elementType": "geometry",
    "stylers": [{
      "color": "#f5f5f5"
    }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#616161"
    }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{
      "color": "#f5f5f5"
    }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [{
      "color": "#666666"
    }]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#bdbdbd"
    }]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [{
      "color": "#808080"
    }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{
      "color": "#eeeeee"
    }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#757575"
    }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{
      "color": "#e5e5e5"
    }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#9e9e9e"
    }]
  },
  {
    "featureType": "road",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{
      "color": "#ffffff"
    }]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#757575"
    }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{
      "color": "#dadada"
    }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#616161"
    }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#9e9e9e"
    }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{
      "color": "#e5e5e5"
    }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{
      "color": "#eeeeee"
    }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{
      "color": "#c9c9c9"
    }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [{
      "visibility": "off"
    }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{
      "color": "#9e9e9e"
    }]
  }
];


var pointStyles = {
  'view': {
    'color': 'rgb(33, 150, 243)',
    'fillColor': 'rgb(33, 150, 243)',
    'fillOpacity': 0.2,
    'radius': 35000,
    'pane': 'overlayPane'
  },
  'commitment': {
    'color': 'rgb(29, 41, 114)',
    'fillColor': 'rgb(29, 41, 114)',
    'fillOpacity': 0.6,
    'radius': 55000,
    'pane': 'markerPane'
  }
};

var pageviews = 0;
var commitments = 0;

var from = null;
var to = null;

var lastEvaluatedKey;

// Displays the points data provided.
function displayPoints(data) {

  return new Promise(function(resolve, reject) {

    if (data.hasOwnProperty('LastEvaluatedKey')) {
      lastEvaluatedKey = data.LastEvaluatedKey.Id;
    } else {
      lastEvaluatedKey = 'finished';
     }

    for (var i = 0; i < data.Items.length; i++) {

      // Create LatLng object
      var LatLng = new google.maps.LatLng({
        lat: data.Items[i].Coordinates[0],
        lng: data.Items[i].Coordinates[1]
      });

      var circle = new google.maps.Circle({
        fillColor: pointStyles[data.Items[i].Action].fillColor,
        fillOpacity: pointStyles[data.Items[i].Action].fillOpacity,
        map: map,
        center: LatLng,
        radius: pointStyles[data.Items[i].Action].radius,
        strokeWeight: 0
      });

      if (data.Items[i].Action === 'view') {
        pageviews++;
      }
      if (data.Items[i].Action === 'commitment') {
        commitments++;
      }
    }
    document.getElementById("pageviews").innerText = pageviews;
    document.getElementById("commitments").innerText = commitments;
    resolve('All points processed');
  });

}


// Updates map with latest real time data
// https://developers.google.com/web/fundamentals/getting-started/primers/promises
function get(url) {

  // Return a new promise.
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
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

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
    if (from === null) {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      d = d.getTime() / 1000;

      if (to === null) {
        to = new Date() / 1000;
      }
      timeString = 'from=' + d + '&to=' + to + '&'; // If from is not set, set to midnight local time in seconds (accurate to the millisecond)
    } else {
      if (to === null) {
        to = new Date() / 1000;
      }
      timeString = 'from=' + from + '&to=' + to + '&';
    }

    var exclusiveStartKeyString = '';
    if (lastEvaluatedKey != undefined && lastEvaluatedKey != 'finished') {
      exclusiveStartKeyString = 'exclusivestartkey=' + lastEvaluatedKey;
    }

    get('/rest/live/read?' + timeString + exclusiveStartKeyString).then(JSON.parse).then(displayPoints).then(function() {
      if (lastEvaluatedKey !== 'finished') {
        promiseChain.runChain();
      } else {
        // Done paginating through data
        from = to + 0.001;
        to = null;
        statusGood('Map connected live');
        return delay(3000).then(function() {
          promiseChain.runChain();
        });
      }
    }, function(error) {
      console.error("callPromise Failed!", error);
      return delay(3000).then(function() {
        promiseChain.runChain();
      });
    }); // Anonymous function
  } // runChain
}; // promiseChain

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
