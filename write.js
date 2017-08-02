/*jshint esversion: 6 */
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

function makeId() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 64; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function getTime() {
  var d = new Date();
  var seconds = Math.round(d.getTime() / 1000);
}

exports.handler = (event, context, callback) => {
  console.log('Event = ' + event);
  const ip = event.sourceIP.split(',', 1)[0]
  console.log('Looking up IP ' + ip)
  const geo = geoip.lookup(ip);
  console.log('Location is ' + geo.ll)
  let id = makeId();
  const currentTime = getTime();
  const currentTimePlusTwentyFourHours = getTime() + 86400;

  const params = {
    TableName: 'impact-map',
    Item: {
      'Id': id,
      'Added': currentTime,
      'Expire': currentTimePlusTwentyFourHours,
      'Coordinates': geo.ll
    },
  };

  // Creates the item
  dynamodb.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2)); // Handles error in console.
      callback('Entry was not successful');
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      callback(null, 'Added item');
    }
  });
}
};
