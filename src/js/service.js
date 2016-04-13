
var service = function() {

    var model = this;

    model.cities = [];

    model.original_datasets = {};

    model.active_datasets = {};

    model.selected_city = '';

    model.visualizations = {};

    model.setSelectedCity = function(city){
        model.selected_city = city;

        console.log("Selected city: "+city);
        // Update vis
        model.visualizations.vis1.updateVis();
    };

    model.getSelectedCity = function(){
        return model.selected_city;
    };

    model.getSelectedCityData = function(){

        var dataset = model.getActiveDataset("cityPmData");
        var foundCityData;

        dataset.forEach(function(cityData){
            if(cityData.city === model.getSelectedCity()){
                foundCityData = cityData;
            }
        });

        return foundCityData;
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

    model.addVisualization = function(name, visualization){
        model.visualizations[name] = visualization;
        console.log("Visualization '"+name+"' registered with the service.");
    };

    model.getVisualization = function(name){
        return model.visualizations[name];
    };

};

module.exports = service;

