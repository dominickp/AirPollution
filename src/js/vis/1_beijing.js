var d3 = require("d3");
var $ = require("jquery");


console.log("src/js/vis/1_beijing.js");

var beijingVis = function (container_selector, service) {

    var model = this;
    model.service = service;

    var data = model.service.getActiveDataset("beijingData");


    var margin = {top: 20, right: 150, bottom: 200, left: 100};
    var width = 950 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // init svg
    model.svgPad = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    model.svg = model.svgPad.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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
        .domain([pmRange[1] + 100, pmRange[0]])
        .range([0, height]);

    var xAxis = d3.svg.axis()
        .scale(dateScale)
        .orient("bottom")
        .tickFormat(d3.time.format("%b"));


    var yAxis = d3.svg.axis()
        .scale(pmScale)
        .orient("left")
        .ticks(6);


    var area = d3.svg.area()
        .x(function (d) {
            return dateScale(d.time);
        })
        .y0(height)
        .y1(function (d) {
            return pmScale(d.pm25);
        });

    model.message = model.svg.append("g");


    model.svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
        .attr("fill", "brown");


    model.svg.append("text")
        .attr("x", -90)
        .attr("y", height / 2)
        .html("(PM 2.5)")
        .attr("class", "axis-label y-axis");

    model.rect = model.svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");


    var axis = model.svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0,0)")
        .call(xAxis);

    axis.selectAll("text")
        .attr("transform", function () {
            return "translate(0,-25)";
        });

    axis.selectAll("line")
        .attr("transform", function () {
            return "translate(0,-6)";
        });


    model.svg.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxis);

    model.front = model.svg.append("g");


    model.vals = [];

    model.update = function () {


        model.vals = [];


        model.cur = 0;
        $("#next_button").val("Play");
        $("#next_button").removeClass("hidden");
        model.message.selectAll("line").remove();
        model.message.selectAll("text").remove();

        if (model.selection) {
            model.selection.remove();
        }
        if (model.focus) {
            model.focus.remove();
        }
        model.rect.attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "white");

    };

    model.cur = 0;
    model.messages = [
        {
            message: '<body xmlns="http://www.w3.org/1999/xhtml"><div><strong>March 7:</strong> Stagnant air is trapped by nearby mountains, resulting in a rapid increase in particulate matter. A strong northerly wind the next day gives residents a reprieve from the dangerous air. See how <a href="http://aqicn.org/faq/2015-11-05/a-visual-study-of-wind-impact-on-pm25-concentration/" target="_blank">wind patterns</a> impact Beijing&rsquo;s air quality.</div></body>',
            date: Date.parse("3/7/15")

        },
        {
            message: '<body xmlns="http://www.w3.org/1999/xhtml"><div><strong>July:</strong> Hot, humid summer weather combined with high pollution puts the elderly at high risk.</div></body>',
            date: Date.parse("7/20/15")
        },
        {
            message: '<body xmlns="http://www.w3.org/1999/xhtml"><div><strong>December 8:</strong> Beijing authorities issue the city&rsquo;s first ever air quality <a href="http://www.nytimes.com/2015/12/09/world/asia/beijing-smog-pollution.html?_r=0" target="_blank">red alert</a> after 24hr pm2.5 values reach 268 micrograms per cubic metre, 10 times the WHO guidelines for daily exposure. 2 million school children ordered to stay home.</div></body>',
            date: Date.parse("12/8/15")
        }];

    model.bisectDate = d3.bisector(function (d) {
        return d.time;
    }).left;

    model.mousemove = function () {
        var x0 = dateScale.invert(d3.mouse(this)[0]),
            i = model.bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i];

        if (!d0 || !d1) {
            return;
        }

        var d = x0 - d0.time > d1.time - x0 ? d1 : d0;
        model.focus.select("rect.AreaTooltip")
            .attr("transform",
                "translate(" + dateScale(d.time) + "," +
                0 + ")");

        model.focus.select("text.AreaTooltipDate")
            .attr("transform",
                "translate(" + (dateScale(d.time) + 10) + "," +
                (height / 5 + 10) + ")")
            .html(d3.time.format("%B %d, %Y")(new Date(d.time)));

        model.focus.select("text.AreaTooltipPopulation")
            .attr("transform",
                "translate(" + (dateScale(d.time) + 10) + "," +
                height / 5 + ")")
            .html(Math.round(d.pm25));
    };

    model.next = function () {


        if (model.cur === 0) {

            model.focus = model.front.append("g")
                .style("display", "none");


            model.focus.append("rect")
                .attr("class", "AreaTooltip")
                .attr("width", 1)
                .attr("height", height);

            model.focus.append("text")
                .attr("class", "AreaTooltipDate");

            model.focus.append("text")
                .attr("class", "AreaTooltipPopulation");


            model.selection = model.front.append("rect")
                .attr("width", 0)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function () {
                    model.focus.style("display", null);
                })
                .on("mouseout", function () {
                    model.focus.style("display", "none");
                })
                .on("mousemove", model.mousemove);


        }
        else if (model.messages.length === model.cur) {

            $("#next_button").addClass("hidden");
            model.rect.transition()
                .duration(500)
                .attr("x", width);

            model.selection.transition()
                .duration(500).attr("width", width);
            return;

        }

        $("#next_button").val("Continue");
        model.rect.transition()
            .duration(500)
            .attr("x", dateScale(model.messages[model.cur].date));

        model.vals.push(model.messages[model.cur]);


        model.message.selectAll("line").data(model.vals).enter().append("line")
            .attr("x1", function (d) {
                return dateScale(d.date) - 1;
            })
            .attr("y1", height)
            .attr("x2", function (d) {
                return dateScale(d.date) - 1;
            })
            .attr("y2", height)
            .style("stroke", "gray")
            .transition()
            .delay(500)
            .duration(200)
            .attr("y2", height + 30)
            .style("stroke-width", 1);

        model.message.selectAll("foreignObject").data(model.vals).enter().append("foreignObject")
            .attr("x", function (d) {
                return dateScale(d.date) - 1;
            })
            .attr("y", height + 40)
            .attr("width", 195)
            .attr("height", 200)
            .html(function (d) {

                return d.message;

            });

        model.selection.transition()
            .duration(1000).attr("width", dateScale(model.messages[model.cur].date));

        model.cur++;
    };

    // "next button"
    $("#next_button").click(model.next);


};

module.exports = beijingVis;
