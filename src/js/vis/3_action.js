var d3 = require("d3");
var $ = require("jquery");

console.log("src/js/vis/3_action.js");

var actionVisualization = function (container_selector, service) {

    var model = this;
    model.city = service.getSelectedCity;
    model.topo = service.getActiveDataset("mapTopoJson");

    var margin = {top: 40, right: 20, bottom: 60, left: 20};

    var width = 400 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;


    // init SVG
    model.svg = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // initVisualization
    //model.svg.selectAll("path")
    //    .data(topojson.feature(model.topo, model.topo.objects.countries).features)
    //    .enter().append("path")
    //    .attr("d", path)
    //    .attr("class", "feature");

    model.svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .text("VIS 3: TODO");

    model.update = function () {

        // show city

    };

    model.update();


};

module.exports = actionVisualization;
