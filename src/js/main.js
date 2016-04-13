var d3 = require("d3");
var q = require("d3-queue");
var topojson = require('topojson');
var $ = require("jquery");
//var typeahead = require("typeahead.js-browserify");
//typeahead.loadjQueryPlugin();
var d3tip = require('d3-tip')(d3);

var Service = require('./service');
var WebController = require('./webController');
var DataProcessing = require('./dataProcessor');
var CityPicker = require('./view/cityPicker');
var Preloader = require('./view/preloader');
var AirVisualization = require('./vis/1_air.js');
var DeathVisualization = require('./vis/2_death.js');
var ActionVisualization = require('./vis/3_action.js');

// Start the service
var service = new Service();

var webController = new WebController(3);

// Sanity check
console.log("src/js/main.js");

// Test libraries are being required properly
console.log('d3', d3);
console.log('d3-queue', q);
console.log('topojson', topojson);
console.log('d3-tip', d3tip);


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
    // do action "deathVisualization.createUpdate" when act 2 is shown.
    webController.setAction(2, deathVisualization.createUpdate);

    // Load vis 3
    var actionVisualization = new ActionVisualization("#vis-3-container", service);
    // do action "actionVisualization.update" when act 3 is shown.
    webController.setAction(3, actionVisualization.update);

    // get all "next" buttons
    var buttons = document.getElementsByClassName("next");

    // give them the on-click action
    if (buttons) {
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].onclick = webController.next;
        }

        buttons[0].onclick = function () {

            // TODO reset to get new data
            console.log("TODO: Reset vis1");

            // Reset vis2
            deathVisualization.reset();

            // reset buttons and hide visualizations
            webController.reset();

            // show vis 1
            webController.next();
        };

        // remove buttons after click (act2, act3)
        webController.setAction(2, function () {
            $(buttons[1]).addClass("hidden");
        });
        webController.setAction(3, function () {
            $(buttons[2]).addClass("hidden");
        });
    }

    //// uncomment to show all visualizations on load. (used while developing)
    //for (var i = 0; i < 3; i++) {
    //    webController.nextNoScroll();
    //}


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

