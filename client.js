var legend = document.getElementById('legend');
var lastUpdated;
var chart;
var table;

function init() {
  chart = new google.visualization.GeoChart(document.getElementById('chart_div'));
  table = new google.visualization.DataTable();
  table.addColumn('number', 'Lat');
  table.addColumn('number', 'Lng');
  table.addColumn('number', 'Commitments'); // Color
  table.addColumn('number', 'Pageviews'); // Size
  refreshData();
}

// Displays the points data provided.
function displayPoints(data) {

  return new Promise(function(resolve, reject) {
    for (var i = 0; i < data.length; i++) {
      var lookup = table.getFilteredRows([{column: 0, value: data[i].Coordinates[0]}, {column: 1, value: data[i].Coordinates[1]}]);
      if (lookup.length > 0) {
        table.setCell(lookup[0], data[i].Action === 'commitment' ? 2 : 3, (table.getValue(lookup[0], data[i].Action === 'commitment' ? 2 : 3)) + 1);
      } else {
      table.addRow([data[i].Coordinates[0], data[i].Coordinates[1], data[i].Action === 'commitment' ? 1 : 0, data[i].Action === 'view' ? 1 : 0]);
    }
      var options = {
        sizeAxis: {
          minValue: 0,
          maxValue: 100
        },
        region: 'world',
        displayMode: 'markers',
        datalessRegionColor: 'rgb(204, 204, 204)',
        colorAxis: {
          colors: ['rgb(33, 150, 243)', 'rgb(63, 81, 181)', 'rgb(57, 73, 171)']
        }
      };

      chart.draw(table, options);
    }

    resolve('All points processed');
  });
}

// https://developers.google.com/web/fundamentals/getting-started/primers/promises
function get(url) {

  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();

    var lastUpdatedString = '';
    if (lastUpdated != null) {
      lastUpdatedString = '?lastupdated=' + lastUpdated;
    }

    lastUpdated = new Date() / 1000;

    req.open('GET', url + lastUpdatedString);
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

    get('/rest/live/read').then(JSON.parse).then(displayPoints).then(function() {
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
