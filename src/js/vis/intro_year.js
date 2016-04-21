var d3 = require("d3");
require('d3-tip')(d3);
//var $ = require("jquery");

console.log("src/js/vis/intro_year.js");

var yearlyVis = function (container_selector, service) {

    var model = this;
    model.service = service;
    model.countries = model.service.getActiveDataset("overtimeData").countries;
    model.years = model.service.getActiveDataset("overtimeData").yearrange;
    model.range = model.service.getActiveDataset("overtimeData").valuerange;
    var margin = {top: 40, right: 200, bottom: 40, left: 40};
    var width = 700 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    // tooltip
    /* Initialize tooltip */
    model.tooltip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        var String = "";
        // var years = [1990, 1995, 2000, 2005, 2010, 2011, 2013];
        String += d["Country Name"] + "<br>";
        if ((d["2013"] - d["1990"]) > 0) {
            String += "Change since 1990: +" + (d["2013"] - d["1990"]).toFixed(2) + "<br>";
            model.tooltip.style("background", "rgba(171, 30, 30, 0.8)");
        }
        else {
            String += "Change since 1990: " + (d["2013"] - d["1990"]).toFixed(2) + "<br>";
            model.tooltip.style("background", "rgba(30, 171, 34, 0.8)");
        }

        if (!d.active) {
            String += "Click to pin";
        }


        return String;
    });


    // init svg
    model.svg = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    model.svg = model.svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    model.labelData = [];
    model.line = model.svg.append("g");
    model.lines = model.svg.append("g");
    model.labels = model.svg.append("g");
    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    x.domain(model.years);

    y.domain(model.range);
    model.svg.call(model.tooltip);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickValues([1990, 1995, 2000, 2005, 2010, 2013])
        .tickFormat(d3.format(""));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function (d) {
            return x(+d.year);
        })
        .y(function (d) {
            return y(d.val);
        });


    model.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    model.svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("PM 2.5");

    model.line.append("line")
        .attr("x1", 0)
        .attr("y1", y(10))
        .attr("x2", width)
        .attr("y2", y(10))
        .style('stroke', 'red')
        .style('opacity', 1)
        .style('stroke-width', '3px');

    model.line.append("text")
        .attr("x", width)
        .attr("y", y(10))
        .style('fill', 'red')
        .text("WHO safe level");


    model.lines.selectAll("path").data(model.countries).enter().append("path")
        .attr("class", "line")
        .style('stroke', 'gray')
        .style('opacity', 0.2)

        .on('mouseover', function (d) {
            d3.select(this).style('stroke', 'brown').style('opacity', 1).style('cursor', 'pointer');
            model.tooltip.show(d);
            if (!d.active) {
                var index = model.labelData.indexOf(d);
                if (index === -1) {
                    model.labelData.push(d);
                    model.updateLabel();
                }

            }

        })
        .on('mouseout', function (d) {
            model.tooltip.hide(d);

            if (!d.active && !d.tempActive) {
                d3.select(this).style('stroke', 'gray').style('opacity', 0.2);

                var index = model.labelData.indexOf(d);
                if (index > -1) {
                    model.labelData.splice(index, 1);
                    model.update();
                }
                return;
            }
            d3.select(this).style('stroke', 'brown').style('opacity', 1);


        })
        .on('click', function (d) {

            var index;

            if (d.active) {
                index = model.labelData.indexOf(d);
                if (index > -1) {
                    model.labelData.splice(index, 1);
                }
            }
            else {
                index = model.labelData.indexOf(d);
                if (index === -1) {
                    model.labelData.push(d);
                }
            }
            d.active = !d.active;
            model.update();
        })
        .attr("d", function (d) {
            return line(d.vals);
        });

    model.setActive = function (d) {
        d.active = true;
        var index = model.labelData.indexOf(d);
        if (index === -1) {
            model.labelData.push(d);

        }
        model.update();

    };

    model.updateLabel = function () {
        // labels
        model.labels.selectAll("text").data(model.labelData, function (d) {
            return d["Country Name"];
        }).exit().remove();

        model.labels.selectAll("text").data(model.labelData, function (d) {
                return d["Country Name"];
            })
            .enter().append("text")
            .attr("x", width)
            .style('fill', function (d) {
                if (d.active) {
                    return 'brown';
                }
                return 'gray';
            })
            .attr("y", function (d) {
                return y(d.vals[6].val);
            })
            .text(function (d) {
                return d["Country Name"];
            })
            .on('mouseover', function (d) {
                d3.select(this).style('cursor', 'pointer');
                model.tooltip.show(d);

            })
            .on('mouseout', model.tooltip.hide)
            .on('click', function (d) {
                model.tooltip.hide(d);
                if (d.active) {
                    var index = model.labelData.indexOf(d);
                    if (index > -1) {
                        model.labelData.splice(index, 1);
                    }
                }
                else {
                    model.labelData.push(d);
                }
                d.active = !d.active;
                model.update();
            });

        //update
        model.labels.selectAll("text").data(model.labelData, function (d) {
                return d["Country Name"];
            })
            .style('fill', function (d) {
                if (d.active) {
                    return 'brown';
                }
                return 'gray';
            });
    };

    model.update = function () {

        model.updateLabel();


        // lines
        model.lines.selectAll("path").data(model.countries)
            .attr("class", "line")
            .style('stroke', function (d) {
                if (!d.active && !d.tempActive) {
                    return "gray";
                }
                return "brown";
            })
            .style('opacity', function (d) {
                if (!d.active && !d.tempActive) {
                    return 0.2;
                }
                d.tempActive = false;
                return 1;
            });

    };


};

module.exports = yearlyVis;
