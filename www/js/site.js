
// RENDER MAP BY DEFAULT DIMENSIONS
$(function () {
    var width = $(window).width(),
        height = $(window).height(),
        svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);
    
    d3.json("data/canadamapprovinces.json", function(error, can) {
        var provinces = topojson.feature(can, can.objects.statelines),
            projection = d3.geo.albers()
                            .center([0, 55.4])
                            .parallels([50, 60])
                            .scale(1250)
                            .translate([width / 2, height / 2]),
            path = d3.geo.path().projection(projection);

        // DRAW MAP
        svg.append("path")
            .datum(provinces)
            .attr("d", path);

        // COLOUR-CODE MAP
        svg.selectAll(".subunit")
            .data(provinces.features)
            .enter().append("path")
            .attr("class", function(d) { return "subunit " + d.id; })
            .attr("d", path);
    });
});

// CLICK ABOUT BUTTON EVENT

// CLICK COMPARE BUTTON EVENT

// CLICK ADD-TO-COMPARE BUTTON EVENT

// SET OR UNSET FILTERING EVENT

// LEGEND APPEAR/DISAPPEAR

// JUMBOTRON APPEAR/DISAPPEAR
