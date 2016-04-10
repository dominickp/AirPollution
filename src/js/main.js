var d3 = require("d3");
var q = require("d3-queue");
var topojson = require('topojson');
//var typeahead = require("typeahead.js-browserify");
//typeahead.loadjQueryPlugin();

var Service = require('./service');
var DataProcessing = require('./dataProcessor');
var CityPicker = require('./view/cityPicker');
var Preloader = require('./view/preloader');
var AirVisualization = require('./vis/1_air.js');
var DeathVisualization = require('./vis/2_death.js');
var ActionVisualization = require('./vis/3_action.js');

// Start the service
var service = new Service();

// Sanity check
console.log("src/js/main.js");

// Test libraries are being required properly
console.log('d3', d3);
console.log('d3-queue', q);
console.log('topojson', topojson);

var initialDataLoad = function (error, worldBankData, cityPmData, mapTopoJson, deathData) {

    var dataProcessing = new DataProcessing(service);
    dataProcessing.process("worldBankData", worldBankData);
    dataProcessing.process("cityPmData", cityPmData);
    dataProcessing.process("mapTopoJson", mapTopoJson);
    dataProcessing.process("deathData", deathData);
    createView();

    // Load vis 1
    var airVisualization = new AirVisualization("#vis-1-container", service);

    // Load vis 2
    var deathVisualization = new DeathVisualization("#vis-2-container", service);


    // Load vis 3
    var actionVisualization = new ActionVisualization("#vis-3-container", service);

};

var createView = function () {
    var cityPicker = new CityPicker(service);
    cityPicker.render();

    var preloader = new Preloader();
    preloader.remove();
};

// Kick everything off
q.queue()
    .defer(d3.csv, "data/World Bank pm2.5 data.xls - Data.csv")
    .defer(d3.csv, "data/WHO_pm_database_clean.csv")
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.csv, "data/WHO_death_data_clean.csv")
    .await(initialDataLoad);

/* Google maps api example usage, for marius */
var GoogleMapsLoader = require('google-maps'); // only for common js environments

GoogleMapsLoader.load(function(google) {
    var gm = new google.maps.Map(document.getElementById('map-example'));
    console.log("google maps api", gm);
});
