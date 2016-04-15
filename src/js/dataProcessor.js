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
        else if (name === "beijingData") {
            processedDataset = model.processBeijingData(dataset);
            service.addOriginalDataset(name, processedDataset);
            service.addActiveDataset(name, processedDataset);
        }
        else {
            throw new Error("Dataset name '" + name + "' has no defined data processing function.");
        }
    };

    model.processBeijingData = function (dataset) {

        var values = [];
        dataset.forEach(function (time) {

            var timestamp = Date.parse(time.date + " " + time.time);
            if (isNaN(timestamp)) {
                console.log("NAN:" + (time.date + " " + time.time));
            }
            else {
                values.push({time: timestamp, pm25: +time.concentration});
            }

        });
        return values;

    };

    model.processDeathDataset = function (dataset) {


        var global = [];
        var zoom = [];
        dataset.forEach(function (cause) {

            var name = cause.Cause;
            var amount = +cause["Deaths per 100000"];
            var percent = +cause["percent-deaths"];
            var id = cause.Id;

            if (isNaN(id)) {
                zoom.push({name: name, amount: amount});
            }
            else {
                global.push({name: name, amount: amount, id: +id, percent: percent});
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
            cities.push({city: city.city, country: city.country});
        });

        return cities;
    };

};

module.exports = dataProcessor;

