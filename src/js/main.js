var logUnderscoreVersion = require('./logVersion');
var d3 = require("d3");
var q = require("d3-queue");
var Bloodhound = require("typeahead.js-browserify").Bloodhound;

var airVis = require('./vis/1_air.js');

// Sanity check
console.log("src/js/main.js");
logUnderscoreVersion();

// Test libraries are being required properly
console.log('d3',d3);
console.log('d3-queue', q);
console.log("bloodhound", Bloodhound);


var createVisualization = function(error, worldBankData){
    console.log("worldBankData", worldBankData);
};

q.queue()
    .defer(d3.csv, "data/World Bank pm2.5 data.xls - Data.csv")
    .await(createVisualization);