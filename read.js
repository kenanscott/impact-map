/*jshint esversion: 6 */
'use strict';
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth();
  const dd = today.getDate();
  const todayEpoch = new Date(yyyy, mm, dd).getTime() / 1000;
  console.log('UTC beginning of the day epoch = ' + todayEpoch);

  let startTime = todayEpoch + 21600;
  console.log('startTime = ' + startTime);
  if (event.lastupdated > 1) {
    console.log('Detecting lastupdated variable, ' + event.lastupdated);
    startTime = Number(event.lastupdated);
  }
  console.log('startTime = ' + startTime);
  let startTimeString = startTime.toString([10]);

  console.log('startTimeString = ' + startTimeString);

  var params = {
    TableName: "impact-map",
    ProjectionExpression: "Coordinates, #b",
    FilterExpression: "Added > :start",
    ExpressionAttributeNames: {
      "#b": "Action"
    },
    ExpressionAttributeValues: {
      ":start": startTime
    }
  };

  let combinedData = [];

  console.log("Scanning table.");
  dynamodb.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      // print all items
      console.log("Scan succeeded.");
      data.Items.forEach(function(item) {
        combinedData = combinedData.concat(item);
      });

      // continue scanning if we have more items, because
      // scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey != "undefined") {
        console.log("Scanning for more...");
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        dynamodb.scan(params, onScan);
      }
      callback(null, combinedData);
    }
  }
};
