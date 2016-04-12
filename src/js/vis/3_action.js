var d3 = require("d3");
var topojson = require("topojson");
var GoogleMapsLoader = require('google-maps');

console.log("src/js/vis/3_action.js");

var actionVisualization = function (container_selector, service) {

        var model = this;
        model.service = service;
        model.topo = service.getActiveDataset("mapTopoJson");

        var margin = {top: 0, right: 0, bottom: 60, left: 0};

        // init data
        var width = 960,
            height = 500,
            radius = 240;

        model.rotate = [0, 0, 0];

        var projection = d3.geo.orthographic()
            .scale(radius)
            .clipAngle(90);

        var path = d3.geo.path()
            .projection(projection);

        // UNCOMMENT FOR MANUAL DRAG
        //model.drag = d3.behavior.drag()
        //    .origin(function () {
        //        model.transition = false;
        //        return {x: model.rotate[0], y: -model.rotate[1]};
        //    })
        //    .on("drag", function () {
        //        model.rotate[0] = d3.event.x;
        //        model.rotate[1] = -d3.event.y;
        //
        //        // limit y axis to make it easier to navigate
        //        if (model.rotate[1] > 50) {
        //            model.rotate[1] = 50;
        //        }
        //
        //        if (model.rotate[1] < -50) {
        //            model.rotate[1] = -50;
        //        }
        //
        //        projection.rotate(model.rotate);
        //        path = d3.geo.path().projection(projection);
        //        model.land.selectAll("path").attr("d", path);
        //    })
        //    .on("dragstart", function () {
        //        model.svg.attr("class", "dragstart");
        //    })
        //    .on("dragend", function () {
        //        model.svg.attr("class", "dragend");
        //    });

        // init SVG
        model.svg = d3.select(container_selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add for Manual drag
        //    .attr("class", "dragend")
        // .call(model.drag);

        model.water = model.svg.append("g");
        model.land = model.svg.append("g");
        model.shadow = model.svg.append("g");
        model.shadow.append("ellipse")
            .attr("cx", width / 2)
            .attr("cy", height - 10)
            .attr("rx", 150)
            .attr("ry", 10)
            .style("opacity", 0.1);

        // set backgroun
        var globe = {type: "Sphere"};

        model.water.append("path")
            .datum(globe)
            .style("fill", "#98E0FF")
            .attr("d", path);


        // set land
        model.land.selectAll("path")
            .data(topojson.feature(model.topo, model.topo.objects.countries).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "feature");

        GoogleMapsLoader.load(function (google) {
            model.locator = new google.maps.Geocoder();
        });


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
                model.land.selectAll("path").attr("d", path);


            });


        }
        ;

// set city
        model.update = function () {

            var cityString = model.service.getSelectedCity();

            if (cityString === null || cityString === "") {
                cityString = "Amsterdam";
                console.log("City String empty. Used " + cityString + " as default.");
            }


            model.locator.geocode({address: cityString}, function (results, status) {
                    // If that was successful
                    if (status === google.maps.GeocoderStatus.OK) {


                        var p = results[0].geometry.location;
                        var city = {type: "Point", coordinates: [p.lng(), p.lat()]};

                        if (model.point !== null) {
                            model.svg.selectAll(".pin").remove();
                        }

                        model.point = model.land.append("path")
                            .datum(city)
                            .attr("d", path.pointRadius(5))
                            .attr("class", "pin pulsate");


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

                        if (!model.transition) {

                            model.startRotate(model.oldrotate, model.rotate);
                        }
                        model.transition = true;


                    }
                    // ====== catch error ======
                    else {
                        console.log("ERROR-CODE: " + status + ". On search: " + cityString);
                    }
                }
            );


        };


    }
    ;

module.exports = actionVisualization;
