var d3 = require("d3");
require('d3-tip')(d3);

console.log("src/js/vis/2_death.js");

var deathVisualization = function (container_selector, service) {

    var model = this;
    model.service = service;
    var svg_name = "img/death.svg";

    // Import svg file as xml.
    d3.xml(svg_name, function (xml) {

        // Take xml as nodes.
        model.imported_node = document.importNode(xml.documentElement, true);

        var margin = {top: 20, right: 200, bottom: 5, left: 0};
        var textmargin = 100;
        var width = 1000 - margin.left - margin.right,
            height = 670 - margin.top - margin.bottom;

        // init svg
        model.svg = d3.select(container_selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        /* Initialize tooltip */
        model.iconTip = d3.tip().attr('class', 'd3-tip').html(function (d) {
            return "This icon is equal to 100.000 deaths due to " + d.disease + "<br>" + d.suffix;
        });

        model.labeltip = d3.tip().attr('class', 'd3-tip').html(function (d) {
            console.log(d);
            if (d.id === 1) {

                if (model.global) {
                    return d.percent + "% of all deaths are caused by " + d.name + ". <br>Click for a detailed breakdown";
                }
                return d.percent + "% of all deaths are caused by " + d.name + ". <br>Click to reset breakdown";

            }
            return d.percent + "% of all deaths are caused by " + d.name;
        });

        /* Invoke the tip in the context of your visualization */
        model.svg.call(model.iconTip);


        model.legend = model.svg.append("g");


        model.svg = model.svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // init sample data
        model.globalData = model.service.getActiveDataset("deathData").global;
        model.pollutionData = model.service.getActiveDataset("deathData").zoom;

        width -= textmargin;
        model.width = width;
        model.boxes = model.svg.append("g").attr("width", model.width);


        model.curData = [];
        model.colorScale = d3.scale.category20().range(
            [
                "#A9E569",
                "#A8ADE7",
                "#6ED28E",
                "#E493BB",
                "brown",
                "#DBBF5C",
                "#79C3DC",
                "#E19A5D",
                "#A0ABCA",
                "#93B27D",
                "#B690BC",
                "#D47E54"
            ]);
        model.picturesPline = 30;
        model.WidthPerImage = model.width / model.picturesPline;
        model.img_height = model.WidthPerImage * 1.8;
        model.img_width = model.WidthPerImage * 1.8;


        // set data to data zoomed in on air pollution
        model.setDataZoom = function () {
            model.global = false;
            var index = 0;
            model.pollutionData.forEach(function (d) {

                for (var i = 0; i < d.amount; i++) {
                    model.curData[model.startAir + index] = ({
                        index: index,
                        disease: d.name,
                        myname: 1 + "-" + index,
                        group: 1,
                        suffix: "Click to reset breakdown"
                    });
                    index++;
                }


            });
        };

        // set data globally
        model.setDataGlobal = function () {
            model.global = true;
            model.curData = [];
            model.globalData.forEach(function (d) {

                if (d.id === 1) {
                    model.startAir = model.curData.length;
                }

                for (var i = 0; i < d.amount; i++) {
                    if (d.id === 1) {
                        model.curData.push({
                            index: i,
                            disease: d.name,
                            myname: d.id + "-" + i,
                            group: d.id,
                            suffix: "Click for a detailed breakdown"
                        });
                    }
                    else {
                        model.curData.push({
                            index: i,
                            disease: d.name,
                            myname: d.id + "-" + i,
                            group: d.id,
                            suffix: ""
                        });
                    }

                }


            });
        };

        model.setDataGlobal();

        //model.createUpdate();

        // set labels
        if (model.global) {

            if (!model.labels) {
                model.labels = model.svg.append("g").call(model.labeltip);
                var lines = 1.5;

                model.labels.selectAll("text").data(model.globalData).enter().append("text")
                    .attr("x", model.width + 10)
                    .attr("y", function (d) {
                        if (d.id === 1) {
                            lines += 0.5;
                        }

                        var y = (lines + ( Math.ceil(d.amount / model.picturesPline) ) / 2) * (model.WidthPerImage) + 10;

                        lines += Math.ceil(d.amount / model.picturesPline);
                        lines += 0.5;
                        // bigger border around air pollution
                        if (d.id === 1) {
                            lines += 0.5;
                        }

                        return y;
                    })
                    .text(function (d) {
                        return "(" + d.percent + "%) " + d.name;
                    })
                    .style("fill", function (d) {
                        if (d.id === 1) {
                            return "#A52A2A";
                        }
                        return "black";
                    })
                    .style("text-anchor", "begin")
                    .on("click", function (d) {
                        if (d.id === 1) {

                            if (model.global) {
                                model.setDataZoom();
                                model.createUpdate();
                            }
                            else {
                                model.setDataGlobal();
                                model.createUpdate();
                            }

                        }

                    })
                    .on('mouseover', function (d) {
                        model.labeltip.show(d);
                        if (d.id === 1) {
                            d3.select(this).style('cursor', 'pointer');
                        }
                    })
                    .on('mouseout', function (d) {
                        model.labeltip.hide(d);
                    });

            }
        }

        // set legend

        model.legend.append("svg")
            .attr("x", 0)
            .attr("y", 10)
            .attr("width", model.img_width)
            .attr("height", model.img_height)
            .each(function () {
                // Clone and append xml node to each data binded element.
                this.appendChild(model.imported_node.cloneNode(true));
            });
        model.legend.append("text")
            .attr("x", model.img_width)
            .attr("y", 10 + (model.img_height / 2))
            .attr("width", 100)
            .attr("fill", "#oA52A2A")
            .text("100.000 deaths");


    });


    // update visualization
    model.createUpdate = function () {

        model.boxes.selectAll(".vis2_wrapper").data(model.curData, function (d) {
                return d.myname;
            })
            .exit()
            .transition()
            .attr("y", 3000)
            .transition()
            .remove();


        // create
        var linesTotal = 1;
        var prevgroup = "";
        var count = 0;

        model.boxes.selectAll(".vis2_wrapper").data(model.curData, function (d) {
            return d.myname;
        }).enter().append("svg")
            .attr("x", function (d) {
                return (d.index * (model.WidthPerImage)) % model.width;
            })
            .attr("y", function (d) {
                if (prevgroup !== d.group) {

                    // bigger border around air pollution
                    if (prevgroup === 1 || d.group === 1) {
                        linesTotal += 0.5;
                    }

                    linesTotal += 0.5;
                    linesTotal += Math.ceil(count / model.picturesPline);
                    prevgroup = d.group;
                    count = 0;
                }
                count++;
                return (Math.floor(d.index / model.picturesPline) + linesTotal) * (model.WidthPerImage);
            })
            .style("fill", function (d) {
                return model.colorScale(d.group);
            })
            .attr("class", "vis2_wrapper")
            .attr("width", 0)
            .attr("height", 0)
            .each(function () {
                // Clone and append xml node to each data binded element.
                this.appendChild(model.imported_node.cloneNode(true));
            })
            .on("click", function (d) {
                if (d.group === 1) {

                    if (model.global) {
                        model.setDataZoom();
                        model.createUpdate();
                    }
                    else {
                        model.setDataGlobal();
                        model.createUpdate();
                    }

                }

            })
            .on('mouseover', function (d) {
                model.iconTip.show(d);
                if (d.group === 1) {
                    d3.select(this).style('cursor', 'pointer');
                }
            })
            .on('mouseout', model.iconTip.hide)
            .transition()
            .delay(function (d) {
                return d.index * 40;
            })
            .attr("width", model.img_width)
            .attr("height", model.img_height);


        // update
        model.boxes.selectAll(".vis2_wrapper").data(model.curData, function (d) {
                return d.myname;
            })
            .style("fill", function (d) {
                return model.colorScale(d.disease);
            });


        // TODO: set tooltip


        // TODO: show deaths by region


    };

    model.reset = function () {
        model.boxes.remove();
        model.boxes = model.svg.append("g").attr("width", model.width);
    };

};

module.exports = deathVisualization;
