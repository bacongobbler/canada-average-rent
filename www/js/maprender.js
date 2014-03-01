
$(function () {
    var width = $(document).width(),
        height = $(document).height(),
        svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);
    
    d3.json("data/canadamap.json", function(error, can) {
        var subunits = topojson.feature(can, can.objects.subunits),
            projection = d3.geo.albers()
                            .center([0, 55.4])
                            .parallels([50, 60])
                            .scale(1250)
                            .translate([width / 2, height / 2]),
            path = d3.geo.path().projection(projection);

        svg.append("path")
            .datum(subunits)
            .attr("d", path);
    });
});

//about click

//compare click

//add-to-compare click 