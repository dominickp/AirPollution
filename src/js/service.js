
var service = function() {

    var model = this;

    model.cities = [];

    model.original_datasets = {};

    model.active_datasets = {};

    model.selected_city = '';

    model.setSelectedCity = function(city){
        console.log("Selected city: "+city); // Update vis
        model.selected_city = city;
    };

    model.getSelectedCity = function(){
        return model.selected_city;
    };

    model.addOriginalDataset = function(name, dataset){
        console.log("Dataset '"+name+"' added to Service", dataset);
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

