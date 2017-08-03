/*jshint esversion: 6 */
'use strict'
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const geoip = require('geoip-lite');

function makeId() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 64; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

exports.handler = (event, context, callback) => {
  console.log('Event = ' + event);
  const ip = event.sourceIP.split(',', 1)[0]
  console.log('Looking up IP ' + ip)
  const geo = geoip.lookup(ip);
  console.log('Location is ' + geo.ll)
  let id = makeId();
  const currentTime = Math.floor(new Date() / 1000);
  const currentTimePlusTwentyFourHours = (Math.floor(new Date() / 1000)) + 86400;
  console.log(geo.ll[0]);
  console.log(geo.ll[1]);
  
  const params = {
    TableName: 'impact-map',
    Item: {
      'Id': id,
      'Added': currentTime,
      'Expire': currentTimePlusTwentyFourHours,
      'Coordinates': geo.ll,
      'Action': event.action
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
};
