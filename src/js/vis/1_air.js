var d3 = require("d3");
var $ = require("jquery");

console.log("src/js/vis/1_air.js");

var airVisualization = function(container_selector, service) {

    var model = this;

    var target_dataset_key = 'cityPmData';

    model.data = service.getActiveDataset(target_dataset_key);


    model.selected_unit = {key:"pm2.5Mean", safe_level:10};


    var margin = {top: 40, right: 20, bottom: 60, left: 20};

    var width = 400 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

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

        model.linear_guage_body = model.svg.append("rect")
            .attr("width", model.x(d3.max(model.data, function(d) {return d[model.selected_unit.key];})))
            .attr("height", 50)
            .style("fill", "url(#gradient)")
            .attr("stroke", "grey");
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

    // Start axis
    model.axis_element = model.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + height + ")");

    model.buildGaugeBackground();

    // Set up these lines in advance
    model.selected_city = model.svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 60)
        .attr("width", 2)
        .attr("fill", "red");

    // WHO Safe Level Line
    model.safe_level = model.svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 60)
        .attr("width", 2)
        .attr("fill", "blue");


    model.updateVis = function(){

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


        model.xAxis.scale(model.x);
        model.svg.select(".x-axis").transition().duration(1500).call(model.xAxis);


        // Update safe level line
        model.safe_level
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

        }


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


    // On constructor
    model.updateVis();



};

module.exports = airVisualization;
