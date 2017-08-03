// Initalizes map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

// Sets the default view of the map
mymap.setView(new L.LatLng(38.1711269, -97.5383369), 5);

// Sets the tile layer from Mapbox
L.tileLayer('https://api.mapbox.com/styles/v1/brandonyates/cj5tvlwng020z2qr7ws0ylg1o/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnJhbmRvbnlhdGVzIiwiYSI6ImNpcTl3a3AzbDAxbmhmeW0xaGYwbmIwNmQifQ.ItJcFDmazEMy-2spCUZrrA', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 10,
  id: 'mapbox.streets'
}).addTo(mymap);

var styles = {
  'view': {
    'color': '#36393d',
    'fillColor': '#36393d',
    'fillOpacity': 0.5,
    'radius': 300
  }
};

// Sets a sample circle in Castle Rock
L.circle([39.376089, -104.853487], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 500
}).addTo(mymap);

var lastUpdated = null;

// Displays the points data provided.
function displayPoints(data) {
  console.log('Displaying day-tah points');
  for (var i = 0; i < data.length; i++) {
    L.circle([data[i].Coordinates[0], data[i].Coordinates[1]], {
      color: styles.view.color,
      fillColor: styles.view.fillColor,
      fillOpacity: styles.view.fillOpacity,
      radius: styles.view.radius
    }).addTo(mymap);
  }
}

// Updates map with latest real time data
function updateMap() {

  var lastUpdatedString = '';
  if (lastUpdated != null) {
    lastUpdatedString = '?lastupdated=' + lastUpdated;
  }

  lastUpdated = new Date() / 1000;

$.ajax({
  type: 'GET',
  url: '/rest/live/read' + lastUpdatedString,
  success: function( result ) {
    console.log(result);
    displayPoints(result);
  },
  dataType: 'json'
});
}

setInterval(updateMap(), 10);
