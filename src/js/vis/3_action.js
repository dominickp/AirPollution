var d3 = require("d3");
var topojson = require("topojson");
var GoogleMapsLoader = require('google-maps');

console.log("src/js/vis/3_action.js");

var actionVisualization = function (container_selector, service) {

    var model = this;
    model.service = service;
    model.topo = service.getActiveDataset("mapTopoJson");

    var margin = {top: 40, right: 20, bottom: 60, left: 20};

    // init data
    var width = 960,
        height = 500,
        radius = 240,
        rotate = [0, 0, 0];

    var projection = d3.geo.orthographic()
        .scale(radius)
        .clipAngle(90);

    var path = d3.geo.path()
        .projection(projection);

    model.drag = d3.behavior.drag()
        .origin(function () {
            return {x: rotate[0], y: -rotate[1]};
        })
        .on("drag", function () {
            rotate[0] = d3.event.x;
            rotate[1] = -d3.event.y;

            // limit y axis to make it easier to navigate
            if (rotate[1] > 50) {
                rotate[1] = 50;
            }

            if (rotate[1] < -50) {
                rotate[1] = -50;
            }

            projection.rotate(rotate);
            path = d3.geo.path().projection(projection);
            model.land.selectAll("path").attr("d", path);
        });

    // init SVG
    model.svg = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(model.drag);

    model.water = model.svg.append("g");
    model.land = model.svg.append("g");

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


    // set city
    model.update = function () {

        var cityString = model.service.getSelectedCity();

        if (cityString === null || cityString === "") {
            cityString = "Amsterdam";
            console.log("City String empty. Used " + cityString + " as default.")
        }


        model.locator.geocode({address: cityString}, function (results, status) {
                // If that was successful
                if (status == google.maps.GeocoderStatus.OK) {

                    var p = results[0].geometry.location;
                    var city = {type: "Point", coordinates: [p.lng(), p.lat()]};


                    projection.rotate([-city.coordinates[0], -city.coordinates[1]]);
                    rotate = projection.rotate();
                    if (rotate[1] > 50) {
                        rotate[1] = 50;
                    }
                    if (rotate[1] < -50) {
                        rotate[1] = -50;
                    }
                    projection.rotate(rotate);

                    path = d3.geo.path().projection(projection);
                    model.svg.selectAll("path").attr("d", path);

                    path = d3.geo.path().projection(projection);
                    model.land.selectAll("path").attr("d", path);

                    if (model.point !== null) {
                        model.svg.selectAll(".pin").remove();
                    }

                    model.point = model.land.append("path")
                        .datum(city)
                        .attr("d", path.pointRadius(0))
                        .attr("class", "pin pulsate")
                        .transition()
                        .duration(500)
                        .attr("d", path.pointRadius(5));


                }
                // ====== catch error ======
                else {
                    console.log("ERROR-CODE: " + status + ". On search: " + cityString);
                }
            }
        );


    };

    GoogleMapsLoader.load(function (google) {
        model.locator = new google.maps.Geocoder();
        model.update();
    });


};

module.exports = actionVisualization;
