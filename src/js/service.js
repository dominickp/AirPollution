
var service = function() {

    var model = this;

    model.cities = [];

    model.original_datasets = {};

    model.active_datasets = {};

    model.addOriginalDataset = function(name, dataset){
        model.original_datasets[name] = dataset;
    };

    model.getOriginalDataset = function(name){
        return model.original_datasets[name];
    };

    model.addActiveDataset = function(name, dataset){
        model.active_datasets[name] = dataset;
    };

    model.getActiveDataset = function(name){
        return model.active_datasets[name];
    };

};

module.exports = service;

