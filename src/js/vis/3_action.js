var d3 = require("d3");
var topojson = require("topojson");
var GoogleMapsLoader = require('google-maps');


var actionVisualization = function (container_selector, service) {

    var information =
        [
            "Breathe deeply and be thankful that your city is one of of those where the average air quality meets the WHO recommendation for fine particulate pollution.<br><br>Keep in mind that pollution values can vary significantly day to day and in different locations within a city, so you there may still be times where the air you breathe is damaging to your health.  Children, those with heart or lung diseases and asthma sufferers are at high risk and should monitor  <a href='http://aqicn.org/map/world/'>air quality</a> before undertaking any strenuous exercise.",
            "Unfortunately the air your breathe is more polluted that the WHO guideline for average fine particulate pollution.  Checking the <a href='http://aqicn.org/map/world/'>air quality</a> in your city should be part of your daily routine so you can protect your health, and the health of your family from the harmful health effects of polluted air <br><br> Keep in mind that pollution values can vary significantly day to day and in different locations within a city, so there are likely to be times where the air you breathe is highly damaging to your health.  Children, those with heart or lung diseases and asthma sufferers are at high risk and should refrain from any strenuous exercise on days with high levels of pollution. <br><br> Purchasing an air pollution mask will allow you to reduce your exposure when you need to be outside during days with poor air quality.  Only masks rated as N95 or higher by the NIOSH are considered effective at filtering the finest and most damaging pollution particles.",
            "Unfortunately you live in a city where the air is polluted with high concentrations of fine particulate matter.  Most likely you are already aware of the problem and may have experienced side effects from breathing this air on a regular basis. Symptoms include irritation of the eyes, nose, and throat; coughing; phlegm; chest tightness; and shortness of breath.<br><br>Checking the <a href='http://aqicn.org/map/world/'>air quality</a> in your city before you go out is essential so you can protect your health, and the health of your family from the harmful health effects of polluted air.  You should stay indoors and reduce physical acting on days with very poor air quality.  Special care should be taken to ensure vulnerable groups including children, those with heart or lung diseases and asthma sufferers are monitored. Particle exposure can cause serious problems in a short period of time, with no warning signs.  <br><br>All citizens should carry an air pollution mask, allowing you to reduce your exposure when you need to be outside during days with poor air quality.  Only masks rated as N95 or higher by the NIOSH are considered effective at filtering the finest and most damaging pollution particles.  Home air filters fitted with a true HEPA filter may also help reduce long-term exposure."
        ];

    var model = this;
    model.service = service;
    model.topo = service.getActiveDataset("mapTopoJson");
    model.coords = service.getActiveDataset("coords");

    // init data
    var width = 800,
        height = 500,
        radius = 240;

    model.rotate = [0, 0, 0];

    var projection = d3.geo.orthographic()
        .scale(radius)
        .clipAngle(90);

    var path = d3.geo.path()
        .projection(projection).pointRadius(1.5);


    // UNCOMMENT FOR MANUAL DRAG
    model.drag = d3.behavior.drag()
        .origin(function () {
            model.transition = false;
            return {x: model.rotate[0], y: -model.rotate[1]};
        })
        .on("drag", function () {
            model.rotate[0] = d3.event.x;
            model.rotate[1] = -d3.event.y;

            // limit y axis to make it easier to navigate
            if (model.rotate[1] > 50) {
                model.rotate[1] = 50;
            }

            if (model.rotate[1] < -50) {
                model.rotate[1] = -50;
            }

            projection.rotate(model.rotate);
            path = d3.geo.path().projection(projection);
            var path2 = d3.geo.path().projection(projection).pointRadius(4);
            var path3 = d3.geo.path().projection(projection).pointRadius(1.5);
            model.land.selectAll("path").attr("d", path);
            model.points.selectAll("path").attr("d", path3);
            model.countryspot.selectAll("path").attr("d", path2);
        })
        .on("dragstart", function () {
            model.svg.attr("class", "dragstart");
        })
        .on("dragend", function () {
            model.svg.attr("class", "dragend");
            model.transition = true;
        });

    // init SVG
    model.svg = d3.select(container_selector).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        // Add for Manual drag
        .attr("class", "dragend")
        .call(model.drag);

    model.water = model.svg.append("g");
    model.land = model.svg.append("g");
    model.points = model.svg.append("g");
    model.countryspot = model.svg.append("g");
    model.shadow = model.svg.append("g");
    model.shadow = model.shadow.append("ellipse")
        .attr("cx", width / 2 + 80)
        .attr("cy", height - 10)
        .attr("rx", 150)
        .attr("ry", 10)
        .style("opacity", 0.0);


    // set background
    var globe = {type: "Sphere"};


    model.water = model.water.append("path")
        .datum(globe)
        .style("fill", "transparent")
        .attr("d", path);

    // set land
    model.land.selectAll("path")
        .data(topojson.feature(model.topo, model.topo.objects.countries).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "feature");


    model.startRotate = function () {


        var velocity = 0.5;

        d3.timer(function () {


            if (model.transition === false) {
                return;
            }


            // UNCOMMENT TO ROTATE TO CITY

            //var y = Math.abs(model.rotate[0] - model.oldrotate[0]);
            //var x = Math.abs(model.rotate[1] - model.oldrotate[1]);
            //if (x < (velocity * 2) - 0.1 && y < (velocity * 2) - 0.1) {
            //    model.transition = false;
            //    return;
            //}
            //if (x > (velocity * 2)) {
            //
            //    if (model.rotate[1] > model.oldrotate[1]) {
            //        model.oldrotate[1] += velocity;
            //    }
            //    else if (model.rotate[1] < model.oldrotate[1]) {
            //        model.oldrotate[1] -= velocity;
            //    }
            //}
            //if (y > (velocity * 2)) {
            //    if (model.rotate[0] > model.oldrotate[0]) {
            //        model.oldrotate[0] += velocity;
            //    }
            //    else if (model.rotate[0] < model.oldrotate[0]) {
            //        model.oldrotate[0] -= velocity;
            //    }
            //}

            // AUTO ROTATION
            model.oldrotate[0] += velocity;

            projection.rotate(model.oldrotate);
            path = d3.geo.path().projection(projection);
            var path3 = d3.geo.path().projection(projection).pointRadius(1.5);
            var path2 = d3.geo.path().projection(projection).pointRadius(4);
            model.land.selectAll("path").attr("d", path);
            model.points.selectAll("path").attr("d", path3);
            model.countryspot.selectAll("path").attr("d", path2);


        });


    }
    ;

// set city
    model.update = function () {

        model.land.selectAll("path")
            .transition()
            .attr("class", "feature");

        model.water.transition()
            .style("fill", "transparent")
            .attr("class", "");

        model.shadow.style("opacity", 0.0);

        var cityString = model.service.getSelectedCityData();


        cityString = (cityString.city + ", " + cityString.country);


        console.log(cityString);


        model.points.selectAll(".pin").remove();

        var datapoints = [];

        var select = null;
        model.points.selectAll(".pin").data(model.coords).enter().append("path")
            .datum(function (d) {

                if (datapoints[d.region]) {
                    datapoints[d.region]++;
                }
                else {
                    datapoints[d.region] = 1;
                }


                return {
                    type: "Point",
                    coordinates: [d.longitude, d.latitude],
                    val: d.city,
                    color: service.regionScale(d.region)
                };
            })
            .attr("class", "notShown")
            .style("fill", function (d) {
                return d.color;
            })
            .transition()
            .delay(function (d, i) {
                return 3 + 3 * i;
            })

            .attr("class", function (d) {
                if (d.val === cityString) {
                    select = d;
                }
                return "pin notSelected";

            })
        ;

        if (model.country !== null) {
            model.countryspot.selectAll(".pin").remove();
        }

        model.country = model.countryspot.append("path")
            .datum(function () {
                console.log(select);
                return select;
            })
            .attr("class", "pin selected");


        model.oldrotate = model.rotate;

        // UNCOMMENT FOR ROTATE TO CITY
        //projection.rotate([-city.coordinates[0], -city.coordinates[1]]);
        //model.rotate = projection.rotate();
        //if (model.rotate[1] > 50) {
        //    model.rotate[1] = 50;
        //}
        //if (model.rotate[1] < -50) {
        //    model.rotate[1] = -50;
        //}

        model.land.selectAll("path")
            .transition()
            .delay(5000)
            .duration(1000)
            .attr("class", "feature2");

        model.water.transition()
            .delay(5000)
            .style("fill", "")
            .attr("class", "water");

        model.shadow.transition()
            .delay(5000).style("opacity", 0.1);

        if (!model.transition) {

            model.startRotate(model.oldrotate, model.rotate);
        }
        model.transition = true;


        var table = $("#datapoints");
        table.empty();

        for (var key in datapoints) {
            if (key !== "undefined")
                if (datapoints.hasOwnProperty(key)) {

                    var row = "<tr><td>" + key + "</td><td>" + datapoints[key] + "</td></tr>";
                    table.append(row);

                }
        }


        var data = model.service.getSelectedCityData()["pm2.5Mean"];

        var i = 0;
        if (data <= 10) {
            i = 0;
        }
        else if (data <= 30) {
            i = 1;
        }
        else {
            i = 2;
        }

        $("#protection").html(information[i]);
    };


};

module.exports = actionVisualization;
