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
        else if (name === "overtimeData") {
            processedDataset = model.processYearlyData(dataset);
            service.addOriginalDataset(name, processedDataset);
            service.addActiveDataset(name, processedDataset);
        }
        else {
            throw new Error("Dataset name '" + name + "' has no defined data processing function.");
        }
    };

    model.processYearlyData = function (dataset) {
        var countries = [];
        var combined = [];

        var lowest = 9000001;
        var highest = 0;

        var years = [1990, 1995, 2000, 2005, 2010, 2011, 2013];
        dataset.forEach(function (d) {

            var vals = [];
            for (var i = 0; i < years.length; i++) {
                d[years[i]] = +d[years[i]];

                if (isNaN(d[years[i]])) {

                    d[years[i]] = "-";

                    if (i > 0 && i < years.length - 1) {

                        var avg = (d[years[i - 1]] + (+d[years[i + 1]])) / 2;

                        if (isNaN(avg)) {
                            return;
                        }
                        vals.push({year: years[i], val: avg});
                    }
                    else {
                        return;
                    }


                }
                else {
                    if (d[years[i]] > highest) {
                        highest = d[years[i]];
                    }
                    if (d[years[i]] < lowest) {
                        lowest = d[years[i]];
                    }

                    vals.push({year: years[i], val: d[years[i]]});
                }
            }
            d.active = false;
            d.tempActive = false;
            d.vals = vals;
            //County Name
            if (d.Type === "Country") {
                countries.push(d);
            }
            else {
                combined.push(d);
            }
        });

        return {countries: countries, combined: combined, yearrange: [1990, 2013], valuerange: [lowest, highest]};
    };

    model.processBeijingData = function (dataset) {

        var values = [];

        var sum = 0;
        var count = 0;
        var curday = null;
        dataset.forEach(function (time) {

            var timestamp = Date.parse(time.date);

            if (curday === null) {
                sum = +time.concentration;
                count = 1;
                curday = timestamp;
            }
            else if (timestamp === curday) {
                sum += +time.concentration;
                count++;
                curday = timestamp;
            }
            else {
                values.push({time: curday, pm25: sum / count});
                sum = +time.concentration;
                count = 1;
                curday = timestamp;

            }


        });

        // add rest
        values.push({time: curday, pm25: sum / count});
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

