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
    'color': 'black',
    'fillColor': 'black',
    'fillOpacity': 0.5,
    'radius': 60,
    'pane': 'overlayPane'
  },
  'commitment': {
    'color': 'red',
    'fillColor': '#f03',
    'fillOpacity': 0.5,
    'radius': 15000,
    'pane': 'markerPane'
  }
};

var lastUpdated = null;

// Displays the points data provided.
function displayPoints(data) {
  console.log('Displaying day-tah points');
  for (var i = 0; i < data.length; i++) {
    L.circle([data[i].Coordinates[0], data[i].Coordinates[1]], {
      color: styles[data[i].Action].color,
      fillColor: styles[data[i].Action].fillColor,
      fillOpacity: styles[data[i].Action].fillOpacity,
      radius: styles[data[i].Action].radius,
      pane: styles[data[i].Action].pane
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

// https://gist.github.com/KartikTalwar/2306741
function refreshData()
{
    x = 3;  // 3 Seconds

    updateMap();

    setTimeout(refreshData, x*1000);
}


refreshData(); // execute function
