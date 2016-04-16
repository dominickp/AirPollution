var $ = require("jquery");

var typeahead = require("typeahead.js-browserify");
typeahead.loadjQueryPlugin();

var introCityPicker = function (service, vis) {

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
                if (substringRegex.test(str["Country Name"])) {
                    matches.push(str);
                    str.tempActive = true;
                }
            });
            model.vis.update();
            cb(matches);
        };
    };

    model.render = function () {
        var el = $('#intro-country.typeahead');
        el.typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'states',
                display: function (loc) {
                    return loc["Country Name"];
                },

                source: model.substringMatcher(service.getActiveDataset("overtimeData").countries)
            }).on('typeahead:selected', function (event, datum) {
            // on selected
            var selectedCity = datum;
            model.vis.setActive(selectedCity);


            // Clear old value
            el.typeahead('val', '');


        });

        $('#intro-country').blur(function () {
            console.log("A");
            var arr = service.getActiveDataset("overtimeData").countries;
            $.each(arr, function (str) {
                str.tempActive = false;

            });
            el.typeahead('val', '');
            model.vis.update();
        });
    };

};

module.exports = introCityPicker;

