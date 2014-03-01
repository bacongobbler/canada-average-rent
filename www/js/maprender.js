
$(function () {
    var rawUrl = window.location.href.split( '/' ),
        url = rawUrl[0] + '://' + rawUrl[2] + '/';

    var width = 960,
        height = 1160;
    
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    d3.json(url + "data/canadamap.json", function(error, can) {
        svg.append("path")
            .datum(topojson.feature(can, can.objects.subunits))
            .attr("d", d3.geo.path().projection(d3.geo.mercator()));
    });
});

//about click

//compare click

//add-to-compare click 
