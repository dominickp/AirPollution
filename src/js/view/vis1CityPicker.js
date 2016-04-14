var $ = require("jquery");

var typeahead = require("typeahead.js-browserify");
typeahead.loadjQueryPlugin();

var cityPicker = function(service) {

    var model = this;

    model.substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substringRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substringRegex.test(str.city) || substringRegex.test(str.country)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    model.render = function(){
        $('#other-city-selector.typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'states',
                display: function(loc){
                    return loc.city + ', ' + loc.country
                },

                source: model.substringMatcher(service.cities)
            }).on('typeahead:selected', function(event, datum) {
            // on selected
            var selectedCity = datum;

            service.addOtherCity(service.getCityData(selectedCity.city));

            // Clear old value
            $('#other-city-selector.typeahead').typeahead('val','');

        });
    };

};

module.exports = cityPicker;

