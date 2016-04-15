var d3 = require("d3");
var $ = require("jquery");
var d3tip = require('d3-tip')(d3);

console.log("src/js/vis/1_beijing.js");

var beijingVis = function (container_selector, service) {

    var model = this;
    model.service = service;

    var data = model.service.getActiveDataset("beijingData");

    model.tooltip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        return "Click";
    });


    var margin = {top: 5, right: 20, bottom: 100, left: 100};
    var width = 800 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // init svg
    model.svg = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    model.svg.call(model.tooltip);

    var dateRange = d3.extent(data, function (d) {
        return d.time;
    });

    var dateScale = d3.time.scale()
        .domain([dateRange[0], dateRange[1]])
        .range([0, width]);


    var pmRange = d3.extent(data, function (d) {
        return d.pm25;
    });

    var pmScale = d3.scale.linear()
        .domain([pmRange[1], pmRange[0]])
        .range([0, height]);

    var xAxis = d3.svg.axis()
        .scale(dateScale)
        .orient("bottom")
        .tickFormat(d3.time.format("%B %Y"));


    var yAxis = d3.svg.axis()
        .scale(pmScale)
        .orient("left");


    var area = d3.svg.area()
        .x(function (d) {
            return dateScale(d.time);
        })
        .y0(height)
        .y1(function (d) {
            return pmScale(d.pm25);
        });

    model.message = model.svg.append("g");


    var path = model.svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
        .attr("fill", "brown");


    model.svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", function () {
            return "rotate(-40)translate(-40,-5)";
        });


    model.svg.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxis);

    model.svg.append("text")
        .attr("x", -90)
        .attr("y", height / 2)
        .html("(PM 2.5)")
        .attr("class", "axis-label y-axis");

    model.front = model.svg.append("g");

    model.rect = model.svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");

    model.vals = [];

    model.update = function () {

        var cityValue = [model.service.getSelectedCityData()];

        model.vals = [];


        model.cur = 0;
        $("#next_button").val("Play");
        $("#next_button").removeClass("hidden");
        model.message.selectAll("line").remove();


        model.rect.attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "white");

    };

    model.cur = 0;

    model.messages = [
        {
            message: "1Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vulputate egestas sapien a pharetra. Vivamus gravida pharetra elit, non malesuada sem ultricies eu.",
            date: new Date(2015, 2, 2)
        },
        {
            message: "2Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vulputate egestas sapien a pharetra. Vivamus gravida pharetra elit, non malesuada sem ultricies eu.",
            date: new Date(2015, 5, 5)
        },
        {
            message: "3Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vulputate egestas sapien a pharetra. Vivamus gravida pharetra elit, non malesuada sem ultricies eu.",
            date: new Date(2015, 8, 8)
        }];


    model.next = function () {


        if (model.messages.length == model.cur) {

            $("#next_button").addClass("hidden");
            model.rect.transition()
                .duration(1000)
                .attr("x", width);
            return;

        }

        $("#next_button").val("Continue");
        model.rect.transition()
            .duration(1000)
            .attr("x", dateScale(model.messages[model.cur].date));

        model.vals.push(model.messages[model.cur]);


        model.message.selectAll("line").data(model.vals).enter().append("line")
            .attr("x1", function (d) {
                return dateScale(d.date) - 5;
            })
            .attr("y1", 0)
            .attr("x2", function (d) {
                return dateScale(d.date) - 5;
            })
            .attr("y2", 0)
            .style("stroke", "#31B0D5")
            .on('mouseover', model.tooltip.show)
            .on('mouseout', model.tooltip.hide)
            .on('click', function (d) {
                if ($("#beijing-message").hasClass("hidden")) {
                    $("#beijing-message").removeClass("hidden");
                    $("#beijing-message").text(d.message);
                }
                else {
                    if ($("#beijing-message").text() === d.message) {
                        $("#beijing-message").addClass("hidden");
                    }
                    else {
                        $("#beijing-message").text(d.message);
                    }
                }


            })
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("y2", height)
            .style("stroke-width", 10);

        model.cur++;
    };

    // "next_button"

    $("#next_button").click(model.next);
};

module.exports = beijingVis;
