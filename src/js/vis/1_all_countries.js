var d3 = require("d3");
var $ = require("jquery");
require('d3-tip')(d3);

console.log("src/js/vis/1_all_countries.js");

var allCountries = function (container_selector, service) {

    var model = this;
    model.service = service;

    var data = model.service.getActiveDataset("cityPmData");
    var xVar = "pm2.5Mean";
    data = data.filter(function (d) {
        return !(isNaN(d[xVar]) || isNaN(d[xVar]));
    });

    model.iconTip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        console.log(d);
        return d.city + ", " + d.country + "<br>PM2.5: " + d[xVar];
    });


    var margin = {top: 20, right: 20, bottom: 100, left: 100};
    var width = 950 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    var radius = 6;
    var padding = 8;
    var radius2 = 3;
    // init svg
    model.svgPad = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    model.svg = model.svgPad.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    model.svg.call(model.iconTip);

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");


    var svg = model.svg;


    var force = d3.layout.force()
        .nodes(data)
        .size([width, height])
        .on("tick", tick)
        .charge(-0.001)
        .gravity(0)
        .chargeDistance(30);

    x.domain(d3.extent(data, function (d) {
        return d[xVar];
    })).nice();
    y.domain([0, height]).nice();

    // Set initial positions
    data.forEach(function (d) {
        d.x = x(d[xVar]);
        d.y = y(height / 2);
        d.color = color(d.region);
        d.radius = radius;
    });


    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + 0 + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("PM 2.5");


    // TODO: Split into different views?

    var node = svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", radius)
        .attr("cx", function (d) {
            return x(d[xVar]);
        })
        .attr("cy", function () {
            return y(height / 2);
        })
        .style("fill", function (d) {
            return d.color;
        })
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .on('mouseover', model.iconTip.show)
        .on('mouseout', model.iconTip.hide);

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + ((i * 20) + 50) + ")";
        });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });


    force.start();

    model.stop = null;

    function tick(e) {

        if (model.stop !== null) {
            force.stop();
        }


        node.each(moveTowardDataPosition(e.alpha));

        node.each(collide(e.alpha));

        node.attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
    }


    function moveTowardDataPosition(alpha) {
        return function (d) {
            d.y += ( y(height / 2) - d.y) * 0.1 * alpha;
        };
    }

    // Resolve collisions between nodes.
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(data);
        return function (d) {
            var r = d.radius + radius + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + radius2 + (d.color !== quad.point.color) * padding;
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.y -= y *= l;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }

    var who = svg.append("g");
    who.append("line")
        .attr("x1", x(15))
        .attr("y1", 0)
        .attr("x2", x(15))
        .attr("y2", height)
        .style("stroke", "black")
        .style("stroke-width", 2);

    who.append("text")
        .attr("class", "label")
        .attr("x", x(15))
        .attr("y", -10)
        .style("text-anchor", "middle")
        .text("WHO SAFE VALUE");


    model.update = function () {

        if (model.cityline) {
            model.cityline.remove();
            model.others.remove();
        }
        model.others = svg.append("g");
        model.cityline = svg.append("g");

        var city = model.service.getSelectedCityData();


        //var y = 0;
        var values = [];

        var total = 0;
        var better = 0;

        node.data(data)
            .each(function (d) {

                if (d[xVar] > city[xVar]) {

                    better++;
                }
                total++;
                if (d.country === city.country) {

                    d.lineY = d3.select(this).attr("cy");
                    if (d.lineY > 0) {
                        values.push(d);
                    }

                }
            });

        // set cities in country lines
        var lowest = 9001;
        var highest = 0;

        values.forEach(function (d) {

            model.others.append("line")
                .attr("x1", x(d[xVar]))
                .attr("y1", d.lineY)
                .attr("x2", x(d[xVar]))
                .attr("y2", height + 15)
                .style("stroke", "black")
                .style("stroke-width", 1);

            if (x(d[xVar]) > highest) {
                highest = x(d[xVar]);
            }
            if (x(d[xVar]) < lowest) {
                lowest = x(d[xVar]);
            }

        });

        model.others.append("line")
            .attr("x1", lowest)
            .attr("y1", height + 15)
            .attr("x2", highest)
            .attr("y2", height + 15)
            .style("stroke", "black")
            .style("stroke-width", 1);

        model.cityline.append("text")
            .attr("class", "label")
            .attr("x", (highest + lowest) / 2)
            .attr("y", height + 25)
            .style("text-anchor", "middle")
            .style("fill", "black")
            .text(city.country);

        $("#cityName").text(city.city + ", " + city.country);
        $("#percent").text((better / total * 100).toFixed(2));

        model.stop = true;

    };

    setTimeout(function () {
        model.stop;
    }, 4000);


};

module.exports = allCountries;
