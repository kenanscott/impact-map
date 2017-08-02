/*jshint esversion: 6 */
var AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
    console.log('Event = ' + event);
    const ip = event.sourceIP.split(',', 1)[0]
    console.log('Looking up IP ' + ip)
    const geo = geoip.lookup(ip);
    console.log('Location is ' + geo.ll)
    
    callback(null, 'Hello from Lambda');
};
