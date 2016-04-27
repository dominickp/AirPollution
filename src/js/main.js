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
var NumberCityPicker = require('./view/numbersCityPicker');
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
//console.log("src/js/main.js");

// Test libraries are being required properly
//console.log('d3', d3);
//console.log('d3-queue', q);
//console.log('topojson', topojson);
//console.log('d3-tip', d3tip);
//console.log('sweetalert', sweetalert);

var checkbrowser = function () {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection

    var ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua)) {
        swal(
            {
                type: "error",
                title: "Sorry, device unsupported.",
                text: "This interactive story does not work on mobile phones.",
                showConfirmButton: false
            }
        );
    }
    else if (!isChrome && !isFirefox && !isOpera && !isSafari) {
        swal(
            {
                type: "error",
                title: "Sorry, browser unsupported.",
                text: "This interactive story works in Chrome, Opera, Safari and Firefox.",
                showConfirmButton: false
            }
        );
    }

};

var initialDataLoad = function (error, worldBankData, cityPmData, mapTopoJson, deathData, beijingData, overtimeData, metrics, delhi, coords) {

    var dataProcessing = new DataProcessing(service);
    dataProcessing.process("worldBankData", worldBankData);
    dataProcessing.process("cityPmData", cityPmData);
    dataProcessing.process("mapTopoJson", mapTopoJson);
    dataProcessing.process("deathData", deathData);
    dataProcessing.process("beijingData", beijingData);
    dataProcessing.process("delhiData", delhi);
    dataProcessing.process("overtimeData", overtimeData);
    dataProcessing.process("metrics", metrics);
    dataProcessing.process("coords", coords);
    createView();

    checkbrowser();


    var beijing_message =
        [
            {
                message: '<body xmlns="http://www.w3.org/1999/xhtml"><div><strong>March 7:</strong> Stagnant air is trapped by nearby mountains, resulting in a rapid increase in particulate matter. A strong northerly wind the next day gives residents a reprieve from the dangerous air. See how <a href="http://aqicn.org/faq/2015-11-05/a-visual-study-of-wind-impact-on-pm25-concentration/" target="_blank">wind patterns</a> impact Beijing&rsquo;s air quality.</div></body>',
                date: Date.parse("3/7/2015")

            },
            {
                message: '<body xmlns="http://www.w3.org/1999/xhtml"><div><strong>July:</strong> Hot, humid summer weather combined with high pollution puts the elderly at high risk.</div></body>',
                date: Date.parse("7/20/2015")
            },
            {
                message: '<body xmlns="http://www.w3.org/1999/xhtml"><div><strong>December 8:</strong> Beijing authorities issue the city&rsquo;s first ever air quality <a href="http://www.nytimes.com/2015/12/09/world/asia/beijing-smog-pollution.html?_r=0" target="_blank">red alert</a> after 24hr pm2.5 values reach 268 micrograms per cubic metre, 10 times the WHO guidelines for daily exposure. 2 million school children ordered to stay home.</div></body>',
                date: Date.parse("12/8/2015")
            }
        ];


    var delhi_message =
        [
            {
                message: '<body xmlns="http://www.w3.org/1999/xhtml"><strong>Winter</strong> temperature inversions cause cold air to trap pollution, leading sustained high levels of PM2.5 pollution.</body>',
                date: Date.parse("1/17/2015")

            },
            {
                message: '<body xmlns="http://www.w3.org/1999/xhtml">Delhi has a high proportion of diesel cars (which emit more fine particulates) resulting in elevated PM2.5 pollution year round.</body>',
                date: Date.parse("5/5/2015")
            },
            {
                message: '<body xmlns="http://www.w3.org/1999/xhtml"><strong>Diwali:</strong> India&rsquo;s national festival of lights is accompanied by the launching of fireworks across the city. Air <br> quality suffers so much that local authorities urge vulnerable groups to <br> <a href="http://www.theguardian.com/world/2015/nov/11/delhi-warns-against-diwali-fireworks-to-safeguard-air-quality" target="_blank">stay indoors.</a> </body>',
                date: Date.parse("11/9/2015")
            }
        ];

    // load introduction
    var yearVis = new YearVisualization("#vis-intro-container", service);

    var introCityPicker = new IntroCityPicker(service, yearVis);
    introCityPicker.render();

    // Load vis 1
    var citiesToPrepopulate = ['Beijing', 'London', 'Delhi'];
    service.addVisualization("vis1", new AirVisualization("#vis-1-container", service));
    service.getVisualization("vis1").prepopulateCities(citiesToPrepopulate);

    // Load show all vis
    var allCitiesView = new AllCountryVisualization("#vis-1-all", service);
    webController.setAction(1, allCitiesView.update);

    // Load beijing
    var beijingVisualization = new BeijingVisualization("#vis-1-beijing", service, service.getActiveDataset("beijingData"), beijing_message, "next_button_beijing");
    webController.setAction(1, beijingVisualization.update);

    var delhiVisualization = new BeijingVisualization("#vis-1-delhi", service, service.getActiveDataset("delhiData"), delhi_message, "next_button_delhi");
    webController.setAction(1, delhiVisualization.update);

    // Load Numbers
    var numberVis = new NumbersVisualization([
        "#vis-1-numbers_1",
        "#vis-1-numbers_2",
        "#vis-1-numbers_3",
        "#vis-1-numbers_4",
        "#vis-1-numbers_5",
        "#vis-1-numbers_6"
    ], service);

    var numberCityPicker = new NumberCityPicker(service, numberVis);
    numberCityPicker.render();

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
            $(text[0]).addClass("hidden");
        });
        webController.setAction(3, function () {
            $(buttons[2]).addClass("hidden");
            $(text[1]).addClass("hidden");

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
        numberVis.setActiveArray([
            "Egypt, Arab Rep.", "Pakistan", "Cabo Verde", "Bahrain", "Iraq",
            "Saudi Arabia", "Iran", "Niger", "Mali", "Turkmenistan", "Mauritania",
            "Kuwait", "United Arab Emirates", "Yemen, Rep.", "Qatar"
        ], 1);
    });
    $("#hover5").mouseout(numberVis.reset);

    $("#hover6").mouseover(function () {
        numberVis.setActiveArray(["Burkina Faso"], 1);
        numberVis.setActiveArray(["Burkina Faso"], 2);

    });
    $("#hover6").mouseout(numberVis.reset);

    $("#hover7").mouseover(function () {
        numberVis.swap(3);

        numberVis.setActiveArray(
            [
                "Central Europe and the Baltics",
                "East Asia & Pacific (all income levels)",
                "Latin America & Caribbean (all income levels)",
                "Europe & Central Asia (developing only)",
                "European Union",
                "Sub-Saharan Africa (all income levels)",
                "World",
                "Upper middle income",
                "Middle income"
            ],
            3);
    });
    $("#hover7").mouseout(function () {
        numberVis.swap(3);
        numberVis.reset();
    });

    $("#hover8").mouseover(function () {
        numberVis.setActiveArray(["Turkey", "Norway", "Denmark", "Netherlands", "United Kingdom", "Portugal", "Sweden", "Uruguay", "Finland"], 4);

    });
    $("#hover8").mouseout(numberVis.reset);

    $("#intro_1").mouseover(function () {

        yearVis.setActiveArray(["China", "India", "Bangladesh", "Pakistan"]);
    });
    $("#intro_1").mouseout(yearVis.resetSelection);

    $("#intro_2").mouseover(function () {

        yearVis.setActiveArray(["Thailand", "Vietnam", "Cambodia", "Lao PDR"]);
    });
    $("#intro_2").mouseout(yearVis.resetSelection);

    $("#intro_3").mouseover(function () {

        yearVis.setActiveArray(["United States"]);
    });
    $("#intro_3").mouseout(yearVis.resetSelection);

    $("#intro_4").mouseover(function () {

        yearVis.setActiveArray(["United Kingdom", "Germany", "Netherlands", "France", "Spain", "Italy"]);
    });
    $("#intro_4").mouseout(yearVis.resetSelection);

    $("#intro_5").mouseover(function () {

        yearVis.setActiveArray(["Singapore", "Indonesia"]);
    });
    $("#intro_5").mouseout(yearVis.resetSelection);


    $("#but1").click(yearVis.switch);

    // sharable link goes directly to the summary
    var city = getURLParameter("city");
    var country = getURLParameter("country");
    if (city && country) {
        service.setCityCountry(city, country);

        if (service.getSelectedCity() !== null) {

            var text = allCitiesView.updateExternal();
            console.log(text);


        }
    }


};

function getURLParameter(name) {
    return decodeURIComponent((
        new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
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
    .defer(d3.csv, "data/delhi-data-2015.csv")
    .defer(d3.csv, "data/coordinates.csv")
    .await(initialDataLoad);

window.onload = function () {
    // remove watermark slider -Marius
    var els = document.getElementsByTagName("a");
    for (var i = 0, l = els.length; i < l; i++) {
        var el = els[i];
        if (el.href === 'http://juxtapose.knightlab.com/') {
            el.parentElement.removeChild(el);
            return;
        }
    }
}