var d3 = require("d3");
require('d3-tip')(d3);

//console.log("src/js/vis/1_behind_numbers.js");

var behindNumbers = function (container_selectors, service) {

    var model = this;

    // Lookup table
    var lookup = [
        {key: "life", name: "Life expectancy at birth (years)"},
        {key: "precipitation", name: "Annual precipitation (mm)"},
        {key: "forest", name: "Forest area (% of land)"},
        {key: "electricity", name: "Elec. production from coal (% total)"},
        {key: "gasoline", name: "Pump price for gasoline (USD/l)"},
        {key: "education", name: "Enrollment ratio tertiary education (%)"},
        {key: "pm", name: "PM2.5 air pollution, mean annual exposure ( μg/m3)"}];

    /* Initialize tooltip */
    model.tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset(-10,0)
        .html(function (d) {
            return d.name.toString();
        });

    model.values = [];

    for (var p = 0; p < container_selectors.length; p++) {
        model.service = service;
        model.countries = model.service.getActiveDataset("metrics").countries;
        model.other = model.service.getActiveDataset("metrics").aggregate;
        var margin = {top: 0, right: 5, bottom: 30, left: 33};
        var width = 275 - margin.left - margin.right,
            height = 275 - margin.top - margin.bottom;


        // init svg
        model.svg = d3.select(container_selectors[p]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);


        model.svg = model.svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        model.svg.call(model.tooltip);

        var text = model.svg.append("g");

        var points = model.svg.append("g");
        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        // delete NAN
        var data = model.countries.filter(function (d) {
            if (isNaN(d[lookup[p].key])) {
                return false;
            }
            return true;
        });

        var other = model.other.filter(function (d) {
            if (isNaN(d[lookup[p].key])) {
                return false;
            }
            return true;
        });


        var xRange = d3.extent(data, function (d) {
            return d[lookup[p].key];
        });
        x.domain([xRange[0] - (xRange[1] / 10), xRange[1] + (xRange[1] / 10)]);

        // pm 2.5
        var yRange = d3.extent(data, function (d) {
            return d[lookup[lookup.length - 1].key];
        });

        y.domain([yRange[0] - (yRange[1] / 10), yRange[1] + (yRange[1] / 10)]);


        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(4)
            .tickFormat(d3.format(""));

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(3)
            .orient("left");


        model.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("y", 18)
            .attr("x", 0)
            .attr("dy", ".71em")
            .style("text-anchor", "begin")
            .text(lookup[p].name);

        model.svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -30)
            .attr("x", -83)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("PM 2.5");

        points
            .selectAll("circle")
            .data(data, function (d) {
                return d.name;
            })
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d[lookup[p].key]);
            })
            .attr("cy", function (d) {
                return y(d[lookup[lookup.length - 1].key]);
            })
            .style("opacity", 0.3)
            .attr("r", 6)
            .attr("fill", "lightblue")
            .on("mouseover", function (d) {
                model.tooltip.show(d);
                model.setActive(d.name);
            })
            .on("mouseout", function (d) {
                model.tooltip.hide(d);
                model.reset();
            });

        text.selectAll("text").data(data, function (d) {
                return d.name;
            })
            .enter()
            .append("text")
            .attr("x", function (d) {
                return x(d[lookup[p].key]);
            })
            .attr("y", function (d) {
                return y(d[lookup[lookup.length - 1].key])
                    - 10;
            })
            .html(function (d) {
                return d.name;
            }).attr("class", "label")
            .style("opacity", 0);


        model.values.push(
            {
                svg: points,
                text: text,
                data: data,
                spareData: other,
                x: x,
                y: y
            });
    }

    model.active = 0;

    model.setActive = function (name) {
        for (var i = 0; i < container_selectors.length; i++) {
            model.values[i].svg
                .selectAll("circle")
                .data(model.values[i].data, function (d) {
                    return d.name;
                })
                .each(function (d) {
                    if (d.name === name) {
                        d3.select(this).attr("fill", "brown")
                            .style("opacity", 1);
                    }
                });

            model.values[i].text.selectAll("text").data(model.values[i].data, function (d) {
                    return d.name;
                })
                .each(function (d) {
                    if (d.name === name) {
                        d3.select(this).style("opacity", null);
                    }
                });
        }
    };

    model.setActiveOne = function (name, raster) {

        model.active++;
        model.values[raster].svg
            .selectAll("circle")
            .data(model.values[raster].data, function (d) {
                return d.name;
            })
            .each(function (d) {
                if (d.name === name) {
                    d3.select(this).attr("fill", "brown")
                        .style("opacity", 1);
                }
            });


    };

    model.reset = function () {
        for (var i = 0; i < container_selectors.length; i++) {
            model.values[i].svg
                .selectAll("circle")
                .data(model.values[i].data, function (d) {
                    return d.name;
                })
                .attr("fill", "lightblue")
                .style("opacity", 0.3);

            model.values[i].text.selectAll("text").data(model.values[i].data, function (d) {
                    return d.name;
                })
                .style("opacity", 0);

        }

        // remove label

        model.active = 0;
    };


    model.swap = function (raster) {

        model.values[raster].text.selectAll("text").data(model.values[raster].data, function (d) {
                return d.name;
            })
            .style("opacity", 0);

        var tmp = model.values[raster].data;
        model.values[raster].data = model.values[raster].spareData;
        model.values[raster].spareData = tmp;

        model.values[raster].svg
            .selectAll("circle")
            .data(model.values[raster].data, function (d) {
                return d.name;
            })
            .exit()
            .remove();


        model.values[raster].text.selectAll("text").data(model.values[raster].data, function (d) {
                return d.name;
            })
            .enter()
            .append("text")
            .attr("x", function (d) {
                return model.values[raster].x(d[lookup[p].key]);
            })
            .attr("y", function (d) {
                return model.values[raster].y(d[lookup[lookup.length - 1].key])
                    - 10;
            })
            .html(function (d) {
                return d.name;
            }).attr("class", "label")
            .style("opacity", 0);


        model.values[raster].svg
            .selectAll("circle")
            .data(model.values[raster].data, function (d) {
                return d.name;
            })
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return model.values[raster].x(d[lookup[raster].key]);
            })
            .attr("cy", function (d) {
                return model.values[raster].y(d[lookup[lookup.length - 1].key]);
            })
            .style("opacity", 0.3)
            .attr("r", 4)
            .attr("fill", "lightblue")
            .on("mouseover", function (d) {
                model.tooltip.show(d);
                model.setActive(d.name);
            })
            .on("mouseout", function (d) {
                model.tooltip.hide(d);
                model.reset();
            });


        model.values[raster].svg
            .selectAll("circle")
            .data(model.values[raster].data, function (d) {
                return d.name;
            })

            .attr("cx", function (d) {
                return model.values[raster].x(d[lookup[raster].key]);
            })
            .attr("cy", function (d) {
                return model.values[raster].y(d[lookup[lookup.length - 1].key]);
            });
    };


    model.setActiveArray = function (array, raster) {
        array.forEach(function (d) {
            model.setActiveOne(d, raster);
        })

    };


};

module.exports = behindNumbers;
