var $ = require("jquery");

var typeahead = require("typeahead.js-browserify");
typeahead.loadjQueryPlugin();

var numbersCityPicker = function (service, vis) {

    var model = this;
    model.vis = vis;

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
                str.tempActive = false;
                if (substringRegex.test(str.name)) {
                    matches.push(str);
                    str.tempActive = true;
                }
            });
            cb(matches);
        };
    };

    model.render = function () {
        var el = $('#numbers-country.typeahead');
        el.typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'states',
                display: function (loc) {
                    return loc.name;
                },

                source: model.substringMatcher(service.getActiveDataset("metrics").countries)
            }).on('typeahead:selected', function (event, datum) {
            // on selected
            var selectedCity = datum;
            model.vis.reset();
            model.vis.setActive(selectedCity.name);


            // Clear old value
            el.typeahead('val', '');


        });

        $('#numbers-country').blur(function () {

            el.typeahead('val', '');
        });
    };

};

module.exports = numbersCityPicker;

