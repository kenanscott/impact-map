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
    'color': '#000000',
    'fillColor': '#000000',
    'fillOpacity': 0.5,
    'radius': 35000,
    'pane': 'overlayPane'
  },
  'commitment': {
    'color': 'red',
    'fillColor': '#f03',
    'fillOpacity': 0.5,
    'radius': 75000,
    'pane': 'markerPane'
  }
};

var pageviews = 0;
var commitments = 0;

var lastUpdated = null;

// Displays the points data provided.
function displayPoints(data) {
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
}

function responseCheck() {
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      var response = JSON.parse(httpRequest.responseText);
      displayPoints(response);
    } else {
    }
  }
}


// Updates map with latest real time data
function updateMap() {

  httpRequest = new XMLHttpRequest();

  if (!httpRequest) {
    alert('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }

  var lastUpdatedString = '';
  if (lastUpdated != null) {
    lastUpdatedString = '?lastupdated=' + lastUpdated;
  }

  lastUpdated = new Date() / 1000;

  // Send API GET request for data
  httpRequest.onreadystatechange = responseCheck;
  httpRequest.open('GET', '/rest/live/read' + lastUpdatedString, true);
  httpRequest.send();

}

// https://gist.github.com/KartikTalwar/2306741
function refreshData() {
  x = 3; // 3 Seconds

  updateMap();

  setTimeout(refreshData, x * 1000);
}

refreshData(); // execute function
