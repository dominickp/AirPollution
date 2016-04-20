var d3 = require("d3");
var q = require("d3-queue");
var topojson = require('topojson');
var $ = require("jquery");
//var typeahead = require("typeahead.js-browserify");
//typeahead.loadjQueryPlugin();
var d3tip = require('d3-tip')(d3);
var sweetalert = require('sweetalert');

var Service = require('./service');
var WebController = require('./webController');
var DataProcessing = require('./dataProcessor');
var CityPicker = require('./view/cityPicker');
var IntroCityPicker = require('./view/introCityPicker');
var Vis1CityPicker = require('./view/vis1CityPicker');
var Preloader = require('./view/preloader');
var AirVisualization = require('./vis/1_air.js');
var BeijingVisualization = require('./vis/1_beijing.js');
var DeathVisualization = require('./vis/2_death.js');
var ActionVisualization = require('./vis/3_action.js');
var NumbersVisualization = require('./vis/1_behind_numbers.js');
var YearVisualization = require('./vis/intro_year.js');
var AllCountryVisualization = require('./vis/1_all_countries.js');
// Start the service
var service = new Service();

var webController = new WebController(3, service);

// Sanity check
console.log("src/js/main.js");

// Test libraries are being required properly
console.log('d3', d3);
console.log('d3-queue', q);
console.log('topojson', topojson);
console.log('d3-tip', d3tip);
console.log('sweetalert', sweetalert);


var initialDataLoad = function (error, worldBankData, cityPmData, mapTopoJson, deathData, beijingData, overtimeData, metrics) {

    var dataProcessing = new DataProcessing(service);
    dataProcessing.process("worldBankData", worldBankData);
    dataProcessing.process("cityPmData", cityPmData);
    dataProcessing.process("mapTopoJson", mapTopoJson);
    dataProcessing.process("deathData", deathData);
    dataProcessing.process("beijingData", beijingData);
    dataProcessing.process("overtimeData", overtimeData);
    dataProcessing.process("metrics", metrics);
    createView();


    // load introduction
    var yearVis = new YearVisualization("#vis-intro-container", service);

    var introCityPicker = new IntroCityPicker(service, yearVis);
    introCityPicker.render();

    // Load vis 1
    var citiesToPrepopulate = ['Beijing', 'Puerto La Cruz', 'Peshwar'];
    service.addVisualization("vis1", new AirVisualization("#vis-1-container", service));
    service.getVisualization("vis1").prepopulateCities(citiesToPrepopulate);

    // Load show all vis
    var allCitiesView = new AllCountryVisualization("#vis-1-all", service);
    webController.setAction(1, allCitiesView.update);

    // Load beijing
    var beijingVisualization = new BeijingVisualization("#vis-1-beijing", service);
    webController.setAction(1, beijingVisualization.update);

    // Load Numbers
    var numberVis = new NumbersVisualization(["#vis-1-numbers_1", "#vis-1-numbers_2", "#vis-1-numbers_3", "#vis-1-numbers_4", "#vis-1-numbers_5", "#vis-1-numbers_6"], service);


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
    var text = document.getElementsByClassName("text");
    // give them the on-click action
    if (buttons) {
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].onclick = webController.next;
        }

        buttons[0].onclick = function () {

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
            $(text[1]).addClass("hidden");
        });
        webController.setAction(3, function () {
            $(buttons[2]).addClass("hidden");
            $(text[2]).addClass("hidden");

        });
    }

    // set text hover behind numbers
    $("#hover1").mouseover(function () {
        numberVis.setActiveArray(["Iceland", "Switzerland", "Spain", "Italy", "France", "Sweden", "Norway", "Luxembourg", "Netherlands", "Austria", "United Kingdom", "Ireland"], 0);
    });
    $("#hover1").mouseout(numberVis.reset);

    $("#hover2").mouseover(function () {
        numberVis.setActiveArray(["Swaziland", "Mozambique", "Zimbabwe", "Angola", "Central African Republic", "Somalia", "Equatorial Guinea", "Malawi"], 0);
    });
    $("#hover2").mouseout(numberVis.reset);

    $("#hover3").mouseover(function () {
        numberVis.setActiveArray(["Qatar", "United Arab Emirates", "Bahrain", "Kuwait", "Saudi Arabia", "Oman"], 0);
    });
    $("#hover3").mouseout(numberVis.reset);

    $("#hover4").mouseover(function () {
        numberVis.setActiveArray(["China"], 0);
    });
    $("#hover4").mouseout(numberVis.reset);

    $("#hover5").mouseover(function () {
        numberVis.setActiveArray(["Egypt, Arab Rep.", "Pakistan", "Cabo Verde", "Bahrain", "Iraq", "Saudi Arabia", "Iran", "Niger", "Mali", "Turkmenistan", "Mauritania", "Kuwait", "United Arab Emirates", "Yemen, Rep.", "Qatar"], 1);
    });
    $("#hover5").mouseout(numberVis.reset);

    $("#hover6").mouseover(function () {
        numberVis.setActiveArray(["Burkina Faso"], 1);
        numberVis.setActiveArray(["Burkina Faso"], 2);

    });
    $("#hover6").mouseout(numberVis.reset);

    $("#hover7").mouseover(function () {
        numberVis.swap(5);

        numberVis.setActiveArray(
            [
                "Central Europe and the Baltics",
                "East Asia & Pacific (all income levels)",
                "Latin America & Caribbean (all income levels)",
                "Europe & Central Asia (developing only)",
                "European Union"],
            5);
    });
    $("#hover7").mouseout(function () {
        numberVis.swap(5);
        numberVis.reset();
    });

    // if true

    var city = getURLParameter("city");
    var country = getURLParameter("country");
    if (city && country) {
        service.setCityCountry(city, country);

        if (service.getSelectedCity() !== null) {
            webController.skiptolast();
        }
    }


};

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
}

var createView = function () {
    var cityPicker = new CityPicker(service);
    cityPicker.render();

    var vis1CityPicker = new Vis1CityPicker(service);
    vis1CityPicker.render();

    var preloader = new Preloader();
    preloader.remove();
};

// Kick everything off
q.queue()
    .defer(d3.csv, "data/World Bank pm2.5 data.xls - Data.csv")
    .defer(d3.csv, "data/WHO_pm_database_clean.csv")
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.csv, "data/WHO_death_data_clean.csv")
    .defer(d3.csv, "data/beijing-data-2015.csv")
    .defer(d3.csv, "data/World Bank pm2.5 over time.csv")
    .defer(d3.csv, "data/World Bank six key metrics.csv")
    .await(initialDataLoad);

