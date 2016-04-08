
var dataProcessor = function(service) {

    var model = this;

    model.process = function(name, dataset){
        var processedDataset;

        if(name === "worldBankData"){
            processedDataset = model.processWorldBankPm25Dataset(dataset);
            service.addOriginalDataset(name, processedDataset);
            service.addActiveDataset(name, processedDataset);
        } else if(name === "cityPmData"){
            processedDataset = model.processPmCitiesDataset(dataset);
            service.addOriginalDataset(name, processedDataset);
            service.addActiveDataset(name, processedDataset);
            service.cities = model.getCities(processedDataset);
        } else {
            throw new Error("Dataset name '"+name+"' has no defined data processing function.");
        }
    };

    model.processPmCitiesDataset = function(dataset){

        dataset.forEach(function(city){
            city["pm2.5Mean"] = +city["pm2.5Mean"];
            city.pm10Mean = +city.pm10Mean;
        });

        return dataset;
    };

    model.processWorldBankPm25Dataset = function(dataset){

        return dataset;
    };

    model.getCities = function(cityPmData){
        var cities = [];

        cityPmData.forEach(function(city){
            cities.push(city.city);
        });

        return cities;
    };

};

module.exports = dataProcessor;

