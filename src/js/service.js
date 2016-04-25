var service = function () {

    var model = this;

    model.cities = [];

    model.original_datasets = {};

    model.active_datasets = {};

    model.selected_city = null;

    model.other_cities = [];

    model.visualizations = {};

    model.setSelectedCity = function (city) {
        model.selected_city = city;

        console.log(city);

        $("#city_choice_name").text(city.city + ", " + city.country);
        $("#city_choice").removeClass("hidden");

        // Update vis
        model.visualizations.vis1.updateVis();
    };

    model.getSelectedCity = function () {
        if (model.selected_city === null) {
            return null;
        }

        return model.selected_city.city;
    };

    model.setCityCountry = function (name, country) {
        var dataset = model.getActiveDataset("cityPmData");


        dataset.forEach(function (cityData) {
            if (cityData.city === name && cityData.country === country) {
                model.setSelectedCity(cityData);
            }
        });
    };

    model.getCityData = function (name) {

        var dataset = model.getActiveDataset("cityPmData");
        var foundCityData;

        dataset.forEach(function (cityData) {
            if (cityData.city === name) {
                foundCityData = cityData;
            }
        });

        return foundCityData;
    };

    model.addOtherCity = function (cityData) {

        // Check to see if it's already a selected city
        var exists = false;
        // Check other cities
        model.getOtherCities().forEach(function (existingCityData) {
            if (cityData === existingCityData) {
                exists = true;
            }
        });

        // Check selected city
        if (model.getSelectedCityData() === cityData) {
            exists = true;
        }

        if (exists === true) {
            console.log("exists.");
            return false;
        }

        model.other_cities.push(cityData);

        console.log("Other city added: " + cityData.city);
        // Update vis
        model.visualizations.vis1.updateVis();
    };

    model.getOtherCity = function (index) {
        return model.other_cities[index];
    };

    model.getOtherCities = function () {
        return model.other_cities;
    };

    model.removeOtherCity = function (index) {
        model.other_cities.splice(index, 1);
        // Update vis
        model.visualizations.vis1.updateVis();
    };

    model.getSelectedCityData = function () {

        return model.selected_city;
    };

    model.addOriginalDataset = function (name, dataset) {
        console.log("Dataset '" + name + "' added to Service", dataset);
        model.original_datasets[name] = dataset;
    };

    model.getOriginalDataset = function (name) {
        return model.original_datasets[name];
    };

    model.addActiveDataset = function (name, dataset) {
        model.active_datasets[name] = dataset;
    };

    model.getActiveDataset = function (name) {
        return model.active_datasets[name];
    };

    model.addVisualization = function (name, visualization) {
        model.visualizations[name] = visualization;
        console.log("Visualization '" + name + "' registered with the service.");
    };

    model.getVisualization = function (name) {
        return model.visualizations[name];
    };

};

module.exports = service;

