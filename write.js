/*jshint esversion: 6 */
var AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
    console.log(event);
    console.log(event.sourceIP.split(',', 1)[0])
    callback(null, 'Hello from Lambda');
};
