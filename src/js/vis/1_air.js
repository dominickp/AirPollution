console.log("src/js/vis/1_air.js");

var airVisualization = function(container_selector, service) {

    var model = this;

    var target_dataset_key = 'cityPmData';

    model.data = service.getActiveDataset(target_dataset_key);


    model.selected_unit = "pm2.5Mean";
    model.safe_25_level = 10;
    model.safe_10_level = 25;

    var margin = {top: 40, right: 40, bottom: 60, left: 60};

    var width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // Initialize axis and scales
    model.x = d3.scale.linear()
        .range([0, width]);

    model.svg = d3.select(container_selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    model.update = function(){

        model.x.domain([
            d3.min(model.data, function(d) {return d[model.selected_unit]}),
            d3.max(model.data, function(d) {return d[model.selected_unit]})
        ]);


        // Draw the linear gauge body
        var gradient = model.svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0")
            .attr("spreadMethod", "pad");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#FFF")
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#c00")
            .attr("stop-opacity", 1);


        model.linear_guage_body = model.svg.append("rect")
            .attr("width", model.x(d3.max(model.data, function(d) {return d[model.selected_unit]})))
            .attr("height", 50)
            .style("fill", "url(#gradient)")
            .attr("stroke", "black");


        model.safe_level = model.svg.append("rect")
            .attr("x", model.x(model.safe_10_level))
            .attr("y", 0)
            .attr("height", 60)
            .attr("width", 2)
            .attr("fill", "blue");

        console.log(model.x(model.safe_10_level));


        //console.log(model.x(50));



        // Add circles to line
        //var circle = svg.selectAll("circle")
        //    .data(data);
        //
        //// Enter (initialize the newly added elements)
        //circle.enter()
        //    .append("circle")
        //    .attr("fill", "darkgreen")
        //    .attr("class", "d3-tip point")
        //    .on('mouseover', tip.show)
        //    .on('mouseout', tip.hide)
        //    .on('click', function(d){showEdition(d)});
        //
        //// Update (set the dynamic properties of the elements)
        //circle
        //    .transition()
        //    .duration(800)
        //    .attr("cx", function(d) { return x(d["YEAR"]); })
        //    .attr("cy", function(d) { return y(d[selected_y_axis_property]); })
        //    .attr("r", 5);
        //
        //// Exit
        //circle
        //    .exit()
        //    .transition()
        //    .duration(800)
        //    .remove();

    }();



};

module.exports = airVisualization;