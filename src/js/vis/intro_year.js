var d3 = require("d3");
require('d3-tip')(d3);
var $ = require("jquery");
var sweetAlert = require("sweetalert");

console.log("src/js/vis/intro_year.js");

var yearlyVis = function (container_selector, service) {

    var model = this;
    model.service = service;
    model.countries = model.service.getActiveDataset("overtimeData").countries;
    model.years = model.service.getActiveDataset("overtimeData").yearrange;
    model.population = model.service.getActiveDataset("metrics").countries;
    model.range = model.service.getActiveDataset("overtimeData").valuerange;
    var margin = {top: 10, right: 200, bottom: 40, left: 80};
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

        }
        else {
            String += "Change since 1990: " + (d["2013"] - d["1990"]).toFixed(2) + "<br>";
        }

        if (!d.active) {
            String += "Click to pin";
        }
        return String;
    });

    model.bartip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        return d.info;
    });

    var better = 0;
    var worse = 0;


    model.countries.forEach(function (d) {

        var popu = 0;
        model.population.forEach(function (e) {
            if (e.name == d["Country Name"]) {
                popu = e.population;
            }
        });

        if ((d["2013"] - d["1990"]) > 0) {
            worse += popu;
        }
        else {
            better += popu;
        }


    });

    // init svg
    model.svg = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    model.svg = model.svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    model.tmpData = [];
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
    model.svg.call(model.bartip);

    var line = d3.svg.line()
        .x(function (d) {
            return x(+d.year);
        })
        .y(function (d) {
            return y(d.val);
        });


    var xAxisSVG = model.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

    var yAxisSVG = model.svg.append("g")
        .attr("class", "y axis");


    model.yLabel = yAxisSVG.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("PM 2.5");

    model.setActive = function (d) {

        if (model.labelData.length >= 10) {
            sweetAlert("Oops...", "You can pin a maximum of 10 countries.", "error");
            return;
        }

        d.active = true;
        var index = model.labelData.indexOf(d);
        if (index === -1) {
            model.labelData.push(d);

        }
        model.update();

    };

    model.setActiveName = function (name) {

        // get country
        var found = null;
        $.each(model.countries, function (i, str) {
            if (str["Country Name"] === name) {
                found = str;
            }
        });


        if (found === null) {
            return;
        }


        found.tmpActive = true;
        var index = model.tmpData.indexOf(found);
        if (index === -1) {
            model.tmpData.push(found);

        }
        model.update();

    };

    model.setActiveArray = function (arr) {
        if (model.isLine === true) {
            arr.forEach(function (d) {
                model.setActiveName(d);
            });
        }

    };

    model.resetSelection = function () {
        $.each(model.countries, function (i, str) {
            str.tmpActive = false;

        });
        model.tmpData = [];
        model.update();

    };

    model.updateLabel = function () {

        if (model.tmpData.length > 0) {
            // show tmplabels
            model.labels.selectAll("text").data(model.tmpData, function (d) {
                return d["Country Name"];
            }).exit().remove();

            model.labels.selectAll("text").data(model.tmpData, function (d) {
                    return d["Country Name"];
                })
                .enter().append("text")
                .attr("x", width)
                .style('fill', function (d) {
                    if (d.tmpActive) {
                        return '#447392';
                    }
                    return 'gray';
                })
                .attr("y", function (d) {
                    return y(d.vals[6].val);
                })
                .text(function (d) {
                    return d["Country Name"];
                });

            //update
            model.labels.selectAll("text").data(model.tmpData, function (d) {
                    return d["Country Name"];
                })
                .style('fill', function (d) {
                    if (d.tmpActive) {
                        return '#447392';
                    }
                    return 'gray';
                });
            relax(model.tmpData);
        }
        else {
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
                        return '#447392';
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
                        if (model.labelData.length > 10) {
                            sweetAlert("Oops...", "You can pin a maximum of 10 countries.", "error");
                            return;
                        }

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
                        return '#447392';
                    }
                    return 'gray';
                })
                .attr("y", function (d) {
                    return y(d.vals[6].val);
                });
            relax(model.labelData);

        }

    };

    model.update = function () {

        model.updateLabel();
        if (model.tmpData.length > 0) {

            model.lines.selectAll("path").data(model.countries)
                .attr("class", "line")
                .style('stroke', function (d) {

                    if (!d.tmpActive) {


                        return "gray";
                    }
                    return "#447392";
                })
                .style('opacity', function (d) {
                    if (!d.tmpActive) {
                        return 0.1;
                    }
                    return 1;
                });

            return;
        }

        // lines
        model.lines.selectAll("path").data(model.countries)
            .attr("class", "line")
            .style('stroke', function (d) {

                if (!d.active && !d.tempActive && !d.tmpActive) {


                    return "gray";
                }
                return "#447392";
            })
            .style('opacity', function (d) {
                if (!d.active && !d.tempActive && !d.tmpActive) {
                    return 0.1;
                }
                d.tempActive = false;
                return 1;
            });

    };

    var again = false;

    var alpha = 0.5;
    var spacing = 9;

    function relax(data) {
        again = false;
        model.labels.selectAll("text").data(data, function (d) {
            return d["Country Name"];
        }).each(function () {
            var a = this;
            var da = d3.select(a);
            var y1 = da.attr("y");
            model.labels.selectAll("text").data(data, function (d) {
                return d["Country Name"];
            }).each(function () {
                var b = this;

                if (a === b) {
                    return;
                }
                var db = d3.select(b);

                if (da.attr("text-anchor") !== db.attr("text-anchor")) {
                    return;
                }

                var y2 = db.attr("y");
                var deltaY = y1 - y2;

                if (Math.abs(deltaY) > spacing) {
                    return;
                }


                again = true;
                var sign = deltaY > 0 ? 1 : -1;
                var adjust = sign * alpha;
                da.attr("y", +y1 + adjust);
                db.attr("y", +y2 - adjust);
            });
        });
        if (again) {
            relax(data);
        }
    }

    model.setBar = function () {

        model.yLabel.text("People");
        var vals = [
            {
                count: better,
                name: "better",
                info: d3.format(",d")(better) + " people breathe air better than in 1990",
                color: "#87CEEB"
            },
            {
                count: worse,
                name: "worse",
                info: d3.format(",d")(worse) + " people breathe air worse than in 1990",
                color: "#7a5e5e"
            }
        ];

        model.labelData = [];
        model.update();

        model.lines.selectAll("path")
            .on('mouseover', model.bartip.hide)
            .transition()
            .delay(function (d, i) {
                d.active = false;
                return 300 + (i * 4);
            })
            .remove();


        model.lines = model.svg.append("g");

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .range([height, 0]);

        x.domain(vals.map(function (d) {
            return d.name;
        }));

        y.domain([0, d3.max(vals, function (d) {
            return d.count;
        }) + 10]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");


        xAxisSVG.transition().duration(1000).call(xAxis);
        yAxisSVG.transition().duration(1000).call(yAxis);

        model.lines.selectAll(".bar")
            .data(vals)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.name);
            })
            .attr("width", x.rangeBand())
            .attr("y", height)
            .attr("height", 0)
            .attr("fill", function (d) {
                return d.color;
            })
            .on('mouseover', model.bartip.show)
            .on('mouseout', model.bartip.hide)
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("y", function (d) {
                return y(d.count);
            })
            .attr("height", function (d) {
                return height - y(d.count);
            });

        model.line.selectAll("line")
            .transition()
            .duration(500)
            .attr("x2", 0)
            .remove();

        model.line.selectAll("text")
            .remove();

    };

    model.isLine = true;


    model.switch = function () {
        if (model.isLine === true) {
            $("#intro-country").prop('disabled', true);
            $("#but1").text('Show countries');

            model.setBar();
            model.isLine = false;
            return;

        }
        $("#intro-country").prop('disabled', false);
        $("#but1").text('Show statistics');
        model.setLine();
        model.isLine = true;

    };


    model.setLine = function () {

        model.yLabel.text("PM 2.5");

        model.lines.selectAll(".bar")
            .transition()
            .attr("y", height)
            .attr("height", 0)
            .transition()
            .remove();


        model.lines = model.svg.append("g");

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        x.domain(model.years);

        y.domain(model.range);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickValues([1990, 1995, 2000, 2005, 2010, 2013])
            .tickFormat(d3.format(""));

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        xAxisSVG.transition().duration(1000).call(xAxis);
        yAxisSVG.transition().duration(1000).call(yAxis);


        model.lines.selectAll("path").data(model.countries).enter().append("path")
            .attr("class", "line")
            .style('stroke', 'gray')
            .style('opacity', 0.1)

            .on('mouseover', function (d) {
                d3.select(this).style('stroke', '#447392').style('opacity', 1).style('cursor', 'pointer');
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
                    d3.select(this).style('stroke', 'gray').style('opacity', 0.1);

                    var index = model.labelData.indexOf(d);
                    if (index > -1) {
                        model.labelData.splice(index, 1);
                        model.update();
                    }
                    return;
                }
                d3.select(this).style('stroke', '#447392').style('opacity', 1);


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

                    if (model.labelData.length > 10) {
                        sweetAlert("Oops...", "You can pin a maximum of 10 countries.", "error");
                        return;
                    }

                    index = model.labelData.indexOf(d);
                    if (index === -1) {
                        model.labelData.push(d);

                    }
                }


                d.active = !d.active;
                model.update();
            })
            .transition()
            .delay(function (d, i) {
                d.active = false;
                return 300 + (i * 4);
            })
            .attr("d", function (d) {
                return line(d.vals);
            });

        model.line.append("line")
            .attr("x1", 0)
            .attr("y1", y(10))
            .attr("x2", 0)
            .attr("y2", y(10))
            .style('stroke', 'red')
            .style('opacity', 1)
            .style('stroke-width', '3px')
            .transition()
            .duration(500)
            .attr("x2", width);

        model.line.append("text")
            .attr("x", width)
            .attr("y", y(10))
            .style('fill', 'red')
            .text("WHO safe level");

    };

    model.setLine();


};

module.exports = yearlyVis;
