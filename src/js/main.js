var logUnderscoreVersion = require('./logVersion');
var d3 = require("d3");
var q = require("d3-queue");
var Bloodhound = require("typeahead.js-browserify").Bloodhound;
var $ = require("jquery");
var typeahead = require("typeahead.js-browserify");
typeahead.loadjQueryPlugin();

var Service = require('./service');
var DataProcessing = require('./dataProcessing');



var airVis = require('./vis/1_air.js');

// Sanity check
console.log("src/js/main.js");
logUnderscoreVersion();

// Test libraries are being required properly
console.log('d3',d3);
console.log('d3-queue', q);
console.log("jquery", $);
console.log("bloodhound", Bloodhound);



var onDataLoad = function(error, worldBankData, cityPmData){

    var service = new Service();
    var dataProcessing = new DataProcessing(service);
    dataProcessing.process("worldBankData", worldBankData);
    dataProcessing.process("cityPmData", cityPmData);

    var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };


    var cities = service.cities;


    $('#city-selector.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'states',
            source: substringMatcher(cities)
        });
};

q.queue()
    .defer(d3.csv, "data/World Bank pm2.5 data.xls - Data.csv")
    .defer(d3.csv, "data/aap_pm_database_may2014.xls - cities.csv")
    .await(onDataLoad);

var engine = new Bloodhound({
    local: ['dog', 'pig', 'moose'],
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer: Bloodhound.tokenizers.whitespace
});
