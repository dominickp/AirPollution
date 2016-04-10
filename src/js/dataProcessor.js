var dataProcessor = function (service) {

    var model = this;

    model.process = function (name, dataset) {
        var processedDataset;

        if (name === "worldBankData") {
            processedDataset = model.processWorldBankPm25Dataset(dataset);
            service.addOriginalDataset(name, processedDataset);
            service.addActiveDataset(name, processedDataset);
        } else if (name === "cityPmData") {
            processedDataset = model.processPmCitiesDataset(dataset);
            service.addOriginalDataset(name, processedDataset);
            service.addActiveDataset(name, processedDataset);
            service.cities = model.getCities(processedDataset);
        } else if (name === "mapTopoJson") {
            // set does not need to be parsed in any way, but has to be added to service.
            service.addOriginalDataset(name, dataset);
            service.addActiveDataset(name, dataset);
        }
        else if (name === "deathData") {
            processedDataset = model.processDeathDataset(dataset);
            service.addOriginalDataset(name, processedDataset);
            service.addActiveDataset(name, processedDataset);
        }
        else {
            throw new Error("Dataset name '" + name + "' has no defined data processing function.");
        }
    };
    model.processDeathDataset = function (dataset) {


        var global = [];
        var zoom = [];
        dataset.forEach(function (cause) {

            var name = cause.Cause;
            var amount = +cause["Deaths per 100000"];
            var id = cause.Id;

            if (isNaN(id)) {
                zoom.push({name: name, amount: amount});
            }
            else {
                global.push({name: name, amount: amount, id: +id});
            }
        });

        global.sort(function (a, b) {
            return b.amount - a.amount;
        });

        return {global: global, zoom: zoom};
    };

    model.processPmCitiesDataset = function (dataset) {

        dataset.forEach(function (city) {
            city["pm2.5Mean"] = +city["pm2.5Mean"];
            city.pm10Mean = +city.pm10Mean;
        });

        return dataset;
    };

    model.processWorldBankPm25Dataset = function (dataset) {

        return dataset;
    };

    model.getCities = function (cityPmData) {
        var cities = [];

        cityPmData.forEach(function (city) {
            cities.push(city.city);
        });

        return cities;
    };

};

module.exports = dataProcessor;

