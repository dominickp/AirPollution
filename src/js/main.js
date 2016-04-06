var logUnderscoreVersion = require('./logVersion');
var d3 = require("d3");
var q = require("d3-queue");

var airVis = require('./vis/1_air.js');

console.log("src/js/main.js");

logUnderscoreVersion();

console.log('d3',d3);
console.log('d3-queue', q);

console.log("hello world");



var createVisualization = function(error, worldBankData){
    console.log("worldBankData", worldBankData);
};

q.queue()
    .defer(d3.csv, "data/World Bank pm2.5 data.xls - Data.csv")
    .await(createVisualization);