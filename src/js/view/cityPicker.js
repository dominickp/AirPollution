var $ = require("jquery");
var sweetalert = require("sweetalert");

var typeahead = require("typeahead.js-browserify");
typeahead.loadjQueryPlugin();

var cityPicker = function (service) {

    var model = this;

    model.substringMatcher = function (strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substringRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function (i, str) {
                if (substringRegex.test(str.city + ", " + str.country)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    model.render = function () {
        $('#city-selector.typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 1,

            },
            {
                name: 'states',
                source: model.substringMatcher(service.getActiveDataset("cityPmData")),
                limit: 15,
                display: function (loc) {
                    return loc.city + ', ' + loc.country;
                },

                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'Location not available',
                        '</div>'
                    ].join('\n'),
                    //suggestion: '<div><strong>{{value}}</strong> – {{year}}</div>'
                }
            }).on('typeahead:selected', function (event, datum) {
            // on selected
            var selectedCity = datum;


            service.setSelectedCity(selectedCity);


            var error = "";


            /*




             */
            if (selectedCity["dataCoverageAlertPM10"].length > 0) {
                error += selectedCity["dataCoverageAlertPM10"] + "<br><br>";
            }
            else if (selectedCity["dataCoverageAlertPM2.5"].length > 0) {
                error += selectedCity["dataCoverageAlertPM2.5"] + "<br><br>";
            }

            if (selectedCity["pm10ConvertedAlert"].length > 0) {
                error += selectedCity["pm10ConvertedAlert"] + "<br><br>";
            }

            if (selectedCity["pm2.5ConvertedAlert"].length > 0) {
                error += selectedCity["pm2.5ConvertedAlert"] + "<br><br>";
            }


            if (error.length > 0) {

                swal({
                    title: "Heads up...",
                    text: error,
                    type: "warning",
                    html: true
                });
            }
        });


        $('#city-selector').blur(function () {

            $('#city-selector.typeahead').typeahead('val', '');
        });
    };

};

module.exports = cityPicker;

