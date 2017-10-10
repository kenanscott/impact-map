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

var styles = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#666666"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#808080"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
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

var lastUpdated = null;

// Displays the points data provided.
function displayPoints(data) {

  return new Promise(function(resolve, reject) {

    for (var i = 0; i < data.length; i++) {

      // Create LatLng object
      var LatLng = new google.maps.LatLng({
        lat: data[i].Coordinates[0],
        lng: data[i].Coordinates[1]
      });

      var circle = new google.maps.Circle({
        fillColor: pointStyles[data[i].Action].fillColor,
        fillOpacity: pointStyles[data[i].Action].fillOpacity,
        map: map,
        center: LatLng,
        radius: pointStyles[data[i].Action].radius,
        strokeWeight: 0
      });

      if (data[i].Action === 'view') {
        pageviews++;
      }
      if (data[i].Action === 'commitment') {
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
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function callPromise() {
  return new Promise(function(resolve, reject) {

  var lastUpdatedString = '';
  if (lastUpdated != null) {
    lastUpdatedString = '?lastupdated=' + lastUpdated;
  }

  lastUpdated = new Date() / 1000;

  get('/rest/live/read' + lastUpdatedString).then(JSON.parse).then(displayPoints).then(function() {
    console.log("callPromise Success!");
    resolve('Success!');
  }, function(error) {
    console.error("callPromise Failed!", error);
    reject(Error(error));
  });
  });
}


// https://gist.github.com/KartikTalwar/2306741
function refreshData() {
  x = 3; // 3 Seconds

  callPromise().then(function() {
    setTimeout(refreshData, x * 1000);
  }, function(error) {
    console.error(error);
    setTimeout(refreshData, x * 1000);
  });
}

// https://stackoverflow.com/questions/26387052/best-way-to-detect-midnight-and-reset-data
setTimeout(
   midnightTask,
   moment("24:00:00", "hh:mm:ss").diff(moment(), 'seconds')
);

function midnightTask() {
  window.location.reload(true);
}

refreshData(); // execute function
