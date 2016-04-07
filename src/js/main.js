var d3 = require("d3");
var q = require("d3-queue");
var typeahead = require("typeahead.js-browserify");
typeahead.loadjQueryPlugin();

var Service = require('./service');
var DataProcessing = require('./dataProcessor');
var CityPicker = require('./view/cityPicker');
var Preloader = require('./view/preloader');

// Start the service
var service = new Service();

// Sanity check
console.log("src/js/main.js");

// Test libraries are being required properly
console.log('d3',d3);
console.log('d3-queue', q);

var initialDataLoad = function(error, worldBankData, cityPmData){

    var dataProcessing = new DataProcessing(service);
    dataProcessing.process("worldBankData", worldBankData);
    dataProcessing.process("cityPmData", cityPmData);

    createView();

};

var createView = function(){
    var cityPicker = new CityPicker(service);
    cityPicker.render();

    var preloader = new Preloader();
    preloader.remove();
};

// Kick everything off
q.queue()
    .defer(d3.csv, "data/World Bank pm2.5 data.xls - Data.csv")
    .defer(d3.csv, "data/WHO_pm_database_clean.csv")
    .await(initialDataLoad);
