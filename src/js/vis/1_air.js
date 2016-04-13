var d3 = require("d3");
var $ = require("jquery");

console.log("src/js/vis/1_air.js");

var airVisualization = function(container_selector, service, prepopulatedCityNames) {

    var model = this;

    var target_dataset_key = 'cityPmData';

    model.data = service.getActiveDataset(target_dataset_key);

    model.selected_unit = {key:"pm2.5Mean", safe_level:10};

    var margin = {top: 40, right: 20, bottom: 60, left: 20};
    var width = 400 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;
    var gauge_height = 50;
    var gauge_label_spacing = 10;

    model.other_cities = [];

    // Helper functions
    model.buildGaugeBackground = function(){
        // Draw the linear gauge body
        var gradient = model.svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0")
            .attr("spreadMethod", "pad");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#FFF")
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#c00")
            .attr("stop-opacity", 1);

        model.linear_guage_body = model.lines.append("rect")
            .attr("width", model.x(d3.max(model.data, function(d) {return d[model.selected_unit.key];})))
            .attr("height", gauge_height)
            .style("fill", "url(#gradient)")
            .attr("stroke", "grey");
    };
    model.updateOtherCitiesView = function(){
        $("#other-selected-cities").html("");
        var other_cities = service.getOtherCities();

        other_cities.forEach(function(cityData, index){
            $("#other-selected-cities").append('<li class="list-group-item" data-index="'+cityData.index+'">'+cityData.city+'</li>');
        });
    };
    model.prepopulateCities = function(citiesArray){
        var cityData;
        citiesArray.forEach(function(cityName){
            cityData = service.getCityData(cityName);
            service.addOtherCity(cityData);
        });
    };

    // Initialize axis and scales
    model.x = d3.scale.linear()
        .range([0, width]);

    model.xAxis = d3.svg.axis()
        .scale(model.x)
        .orient("bottom");

    // Start SVG
    model.svg = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // g group for all of the chart elements
    model.lines = model.svg.append("g");
    model.other_city_g = model.svg.append("g");

    // Start axis
    model.axis_element = model.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + height + ")");

    model.buildGaugeBackground();

    // Set up these lines in advance

    // Selected city
    model.selected_city = model.lines.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", (gauge_height+(gauge_label_spacing*4)))
        .attr("width", 2)
        .attr("fill", "red");
    // Add label
    model.selected_city_text = model.lines.append("text")
        .attr("class", "gauge-line-label")
        .attr("x", 0)
        .attr("y", (gauge_height+(gauge_label_spacing*5)))
        .style("text-anchor", "middle")
        .text("");

    // WHO Safe Level Line
    model.safe_level = model.lines.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", (gauge_height+(gauge_label_spacing*3)))
        .attr("width", 2)
        .attr("fill", "blue");
        // Add label
    model.safe_level_text = model.lines.append("text")
        .attr("class", "gauge-line-label")
        .attr("x", 0)
        .attr("y", (gauge_height+(gauge_label_spacing*4)))
        .style("text-anchor", "middle")
        .text("WHO Safe Level");


    model.updateVis = function(){

        model.other_cities = service.getOtherCities();

        model.x.domain([
            d3.min(model.data, function(d) {return d[model.selected_unit.key];}),
            d3.max(model.data, function(d) {return d[model.selected_unit.key];})
        ]);

        // Update guage body every time
        model.linear_guage_body
            .attr("width", model.x(d3.max(model.data, function(d) {return d[model.selected_unit.key];})))
            .attr("height", 50)
            .style("fill", "url(#gradient)")
            .attr("stroke", "grey");


        // Data join
        model.other_city_lines = model.other_city_g.selectAll("rect")
            .data(model.other_cities);
        model.other_city_labels = model.other_city_g.selectAll("text")
            .data(model.other_cities);

        // Enter
        model.other_city_lines.enter().append("rect")
            .attr("x", function(d){
                return model.x(d[model.selected_unit.key])
            })
            .attr("y", 0)
            .attr("height", function(d, index){
                return (gauge_height+(gauge_label_spacing*(index+4)))
            })
            .attr("width", 2)
            .attr("fill", "green");
        model.other_city_labels.enter().append("text")
            .attr("class", "gauge-line-label")
            .attr("x", function(d){
                return model.x(d[model.selected_unit.key])
            })
            .attr("y", function(d, index){
                return (gauge_height+(gauge_label_spacing*(index+5)))
            })
            .style("text-anchor", "middle")
            .text(function(d){return d.city});

        // Enter + update
        model.other_city_lines
            .transition()
            .duration(800)
            .attr("x", function(d){
            return model.x(d[model.selected_unit.key])
        });

        model.other_city_labels
            .transition()
            .duration(800)
            .attr("x", function(d){
                return model.x(d[model.selected_unit.key])
            });







        model.xAxis.scale(model.x);
        model.svg.select(".x-axis").transition().duration(1500).call(model.xAxis);

        // Update safe level line
        model.safe_level
            .transition()
            .duration(800)
            .attr("x", model.x(model.selected_unit.safe_level));
        // Update safe level text
        model.safe_level_text
            .transition()
            .duration(800)
            .attr("x", model.x(model.selected_unit.safe_level));

        if(service.getSelectedCity() !== ""){

            // Update selected city
            model.active_city_data = service.getSelectedCityData();

            // Update safe level line
            model.selected_city
                .transition()
                .duration(800)
                .attr("x", model.x(model.active_city_data[model.selected_unit.key]));

            // Update safe level text
            model.selected_city_text
                .transition()
                .duration(800)
                .attr("x", model.x(model.active_city_data[model.selected_unit.key]))
                .text(model.active_city_data.city);

        }

        // Update other cities view
        model.updateOtherCitiesView();

    };

    model.unitSelectionListener = function(){
        $(document).ready(function() {
            $('#unit-selection-container .radio label input').click(function () {

                if(this.value === "unit-pm10"){
                    model.selected_unit = {key:"pm10Mean", safe_level:25};
                } else {
                    model.selected_unit = {key:"pm2.5Mean", safe_level:10};
                }
                model.updateVis();

            });
        });
    }();
    //model.otherCitySelectionListener = function(){
    //    $(document).ready(function() {
    //        $('#unit-selection-container .radio label input').click(function () {
    //
    //            if(this.value === "unit-pm10"){
    //                model.selected_unit = {key:"pm10Mean", safe_level:25};
    //            } else {
    //                model.selected_unit = {key:"pm2.5Mean", safe_level:10};
    //            }
    //            model.updateVis();
    //
    //        });
    //    });
    //}();

    // On constructor
    model.updateVis();

};

module.exports = airVisualization;
