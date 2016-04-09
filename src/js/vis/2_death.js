var d3 = require("d3");

console.log("src/js/vis/2_death.js");

var deathVisualization = function (container_selector, service) {

    var model = this;
    model.service = service;
    var svg_name = "/img/death.svg";

    // Import svg file as xml.
    d3.xml(svg_name, function (xml) {

        // Take xml as nodes.
        var imported_node = document.importNode(xml.documentElement, true);

        var margin = {top: 40, right: 90, bottom: 60, left: 20};

        var width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


        // init svg
        model.svg = d3.select(container_selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // init sample data
        model.globalData = [
            {
                name: "Air pollution",
                amount: 55,
                id: 1
            },
            {
                name: "Stroke",
                amount: 25,
                id: 2
            },
            {
                name: "Lung Cancer",
                amount: 15,
                id: 3
            },
            {
                name: "Cancer",
                amount: 11,
                id: 4

            }
        ];

        model.pollutionData = [
            {
                name: "Stroke",
                amount: 11
            },
            {
                name: "Lung Cancer",
                amount: 11
            },
            {
                name: "COPD",
                amount: 11
            },
            {
                name: "???",
                amount: 11
            },
            {
                name: "Long",
                amount: 11
            }
        ];

        model.curData = [];
        var colorScale = d3.scale.category20();

        var picturesPline = 20;
        var WidthPerImage = width / picturesPline;
        var img_height = WidthPerImage * 1.8;
        var img_width = WidthPerImage * 1.8;

        model.boxes = model.svg.append("g");


        // set data to data zoomed in on air pollution
        model.setDataZoom = function () {
            model.global = false;
            var c = 0;
            model.pollutionData.forEach(function (d) {

                for (var i = 0; i < d.amount; i++) {
                    model.curData[c] = ({index: c, disease: d.name, myname: 1 + "-" + c, group: 1});
                    c++;
                }


            });
        };

        // set data globally
        model.setDataGlobal = function () {
            model.global = true;
            model.curData = [];
            model.globalData.forEach(function (d) {

                for (var i = 0; i < d.amount; i++) {
                    model.curData.push({index: i, disease: d.name, myname: d.id + "-" + i, group: d.id});
                }


            });
        };

        model.setDataGlobal();

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
                    return (d.index * (WidthPerImage)) % width;
                })
                .attr("y", function (d) {
                    if (prevgroup !== d.group) {
                        if (prevgroup === 1) {
                            linesTotal += 0.5;
                        }


                        linesTotal += Math.ceil(count / picturesPline);
                        prevgroup = d.group;
                        count = 0;
                    }
                    count++;
                    return (Math.floor(d.index / picturesPline) + linesTotal) * (WidthPerImage);
                })
                .style("fill", function (d) {
                    return colorScale(d.group);
                })
                .attr("class", "vis2_wrapper")
                .attr("width", 0)
                .attr("height", 0)
                .each(function () {
                    // Clone and append xml node to each data binded element.
                    this.appendChild(imported_node.cloneNode(true));
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
                .on("mouseover", function (d) {
                    if (d.group === 1) {
                        d3.select(this).style("fill", "gray").style('cursor', 'pointer');
                    }
                })
                .on("mouseout", function (d) {
                    if (d.group === 1) {
                        d3.select(this).attr("r", 5.5).style("fill", function (d) {
                            return colorScale(d.disease);
                        }).style('cursor', 'default');
                    }
                })
                .transition()
                .delay(function (d) {
                    return d.index * 85;
                })
                .attr("width", img_width)
                .attr("height", img_height);


            // update
            model.boxes.selectAll(".vis2_wrapper").data(model.curData, function (d) {
                    return d.myname;
                })
                .style("fill", function (d) {
                    return colorScale(d.disease);
                });

            // set labels
            if (model.global) {

                if (!model.labels) {
                    model.labels = model.svg.append("g");
                    var lines = 1;
                    model.globalData.forEach(function (d) {

                        var y = (lines + ( Math.ceil(d.amount / picturesPline) / 2)) * (WidthPerImage) + 10;

                        model.labels.append("text")
                            .attr("x", width + 10)
                            .attr("y", y)
                            .text(d.name)
                            .style("text-anchor", "begin");


                        lines += Math.ceil(d.amount / picturesPline);
                        if (d.id === 1) {
                            lines += 0.5;
                        }


                    });
                }
            }


            // TODO: set tooltip

            // TODO: set legend

            // TODO: show deaths by region


        };


        model.createUpdate();


    });

};

module.exports = deathVisualization;
